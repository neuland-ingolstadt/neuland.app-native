import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useUserKind } from '@/contexts/userKind'
import { USER_GUEST } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'
import { buildCanteenWidgetProps } from '@/utils/canteen-widget-utils'
import { FOOD_DETAIL_RESTAURANTS, loadFoodEntries } from '@/utils/food-utils'

/**
 * Keeps the iOS canteen home-screen widget in sync with the meal plan.
 * Loads all canteens so widget configuration can switch restaurants.
 * No-ops on Android/web.
 */
export function useCanteenWidgetSync(): void {
	const { t, i18n } = useTranslation('food')
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
	const showStatic = useFoodFilterStore((state) => state.showStatic)
	const { userKind } = useUserKind()
	const enabled = Platform.OS === 'ios'

	const { data: foodData } = useQuery({
		queryKey: ['meals', FOOD_DETAIL_RESTAURANTS, showStatic ?? false],
		queryFn: () =>
			loadFoodEntries([...FOOD_DETAIL_RESTAURANTS], showStatic ?? false),
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24,
		enabled
	})

	useEffect(() => {
		if (!enabled || foodData == null) {
			return
		}

		void syncCanteenWidget({
			foodData,
			foodLanguage,
			i18nLanguage: i18n.language as LanguageKey,
			userKind: userKind ?? USER_GUEST,
			emptyLabel: t('dashboard.empty')
		})
	}, [enabled, foodData, foodLanguage, i18n.language, t, userKind])
}

async function syncCanteenWidget(
	options: Parameters<typeof buildCanteenWidgetProps>[0]
): Promise<void> {
	try {
		const { default: CanteenWidget } = await import('@/widgets/canteen-widget')
		const props = buildCanteenWidgetProps(options)
		CanteenWidget.updateSnapshot(props)
		CanteenWidget.setConfigurationParameterEnum(
			'restaurant',
			props.restaurants.map((restaurant) => ({
				name: restaurant.title,
				value: restaurant.id
			}))
		)
	} catch (error) {
		console.warn('Failed to update canteen widget', error)
	}
}
