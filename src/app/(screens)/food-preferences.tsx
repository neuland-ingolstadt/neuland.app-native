import { useRouter } from 'expo-router'
import type React from 'react'
import { startTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import AutoShowNextDaySetting from '@/components/Food/auto-show-next-day-setting'
import MultiSectionRadio, {
	type FoodLanguageElement
} from '@/components/Food/food-language-section'
import FormList from '@/components/Universal/form-list'
import PlatformIcon from '@/components/Universal/icon'
import MultiSectionPicker from '@/components/Universal/multi-section-picker'
import SectionView from '@/components/Universal/sections-view'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useWiggleAnimation } from '@/hooks/useWiggleAnimation'
import { lightTheme } from '@/styles/themes'
import type { FormListSections } from '@/types/components'
import { toColor } from '@/utils/uniwind-utils'

export default function FoodPreferences(): React.JSX.Element {
	const { t } = useTranslation('food')
	const warningColor = toColor(useCSSVariable('--color-warning'))
	const elemtents = [
		{
			key: 'IngolstadtMensa',
			title: t('cards.titles.mensa', { ns: 'navigation' })
		},
		{
			key: 'Reimanns',
			title: t('cards.titles.reimanns', { ns: 'navigation' })
		},
		{
			key: 'Canisius',
			title: t('cards.titles.canisius', { ns: 'navigation' })
		},
		{
			key: 'NeuburgMensa',
			title: t('cards.titles.mensaNeuburg', { ns: 'navigation' })
		}
	]

	const languages: FoodLanguageElement[] = [
		{
			key: 'default',
			title: t('preferences.languages.auto')
		},
		{ key: 'de', title: t('preferences.languages.de') },
		{ key: 'en', title: t('preferences.languages.en') }
	]
	const { iconAnimatedStyle, triggerWiggle } = useWiggleAnimation()
	const router = useRouter()

	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const toggleSelectedRestaurant = useFoodFilterStore(
		(state) => state.toggleSelectedRestaurant
	)
	const showStatic = useFoodFilterStore((state) => state.showStatic)
	const setShowStatic = useFoodFilterStore((state) => state.setShowStatic)
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
	const toggleFoodLanguage = useFoodFilterStore(
		(state) => state.toggleFoodLanguage
	)
	const autoShowNextDay = usePreferencesStore((state) => state.autoShowNextDay)
	const setAutoShowNextDay = usePreferencesStore(
		(state) => state.setAutoShowNextDay
	)
	const autoShowNextDayTimeMinutes = usePreferencesStore(
		(state) => state.autoShowNextDayTimeMinutes
	)
	const setAutoShowNextDayTimeMinutes = usePreferencesStore(
		(state) => state.setAutoShowNextDayTimeMinutes
	)

	const handleToggleRestaurant = (name: string) => {
		startTransition(() => {
			toggleSelectedRestaurant(name)
		})
	}

	const handleSetShowStatic = (value: boolean) => {
		startTransition(() => {
			setShowStatic(value)
		})
	}

	const handleToggleLanguage = (language: string) => {
		startTransition(() => {
			toggleFoodLanguage(language)
		})
	}

	const sections: FormListSections[] = [
		{
			header: t('preferences.sections.labels'),
			items: [
				{
					title: t('preferences.formlist.allergens'),
					onPress: () => {
						router.navigate('/food-allergens')
					}
				},
				{
					title: t('preferences.formlist.flags'),
					onPress: () => {
						router.navigate('/food-flags')
					}
				}
			]
		}
	]

	return (
		<ScrollView
			contentContainerStyle={{
				paddingBottom: lightTheme.margins.bottomSafeArea
			}}
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
		>
			<View className="flex-1">
				<SectionView title={t('preferences.sections.restaurants')}>
					<MultiSectionPicker
						elements={elemtents}
						selectedItems={selectedRestaurants}
						action={handleToggleRestaurant}
					/>
				</SectionView>
				<SectionView title={t('preferences.sections.filter')}>
					<SingleSectionPicker
						title={t('preferences.formlist.static')}
						selectedItem={showStatic ?? false}
						action={handleSetShowStatic}
					/>
				</SectionView>
				<View className="self-center mt-4 px-page w-full">
					<FormList sections={sections} />
				</View>
				<SectionView title={t('preferences.formlist.language')}>
					<MultiSectionRadio
						elements={languages}
						selectedItem={foodLanguage}
						action={handleToggleLanguage}
					/>
				</SectionView>
				<SectionView title={t('preferences.settings')}>
					<AutoShowNextDaySetting
						title={t('preferences.autoShowNextDay')}
						timeLabel={t('preferences.autoShowNextDayTime')}
						enabled={autoShowNextDay}
						onToggle={setAutoShowNextDay}
						timeMinutes={autoShowNextDayTimeMinutes}
						onTimeMinutesChange={setAutoShowNextDayTimeMinutes}
					/>
				</SectionView>
			</View>
			<View className="self-center mt-4 px-page w-full">
				<Pressable onPress={triggerWiggle}>
					<View className="items-center self-center bg-card rounded-md flex-row gap-4 px-3.5 py-2 w-full">
						<Animated.View style={iconAnimatedStyle}>
							<PlatformIcon
								ios={{
									name: 'exclamationmark.triangle',
									variant: 'fill',
									size: 21
								}}
								android={{
									name: 'warning',
									size: 24
								}}
								web={{
									name: 'TriangleAlert',
									size: 24
								}}
								style={{ color: warningColor }}
							/>
						</Animated.View>
						<Text className="text-label flex-1 shrink text-[11px] text-left">
							{t('preferences.footer')}
						</Text>
					</View>
				</Pressable>
			</View>
		</ScrollView>
	)
}
