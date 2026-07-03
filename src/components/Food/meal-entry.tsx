import { trackEvent } from '@aptabase/react-native'
import { Link, router } from 'expo-router'
import type React from 'react'
import { memo, use, useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useCSSVariable } from 'uniwind'
import { UserKindContext } from '@/components/contexts'
// @ts-expect-error - no types available
import DragDropView from '@/components/Exclusive/drag-view'
import ContextMenu from '@/components/Flow/context-menu'
import PlatformIcon from '@/components/Universal/icon'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_GUEST } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Meal } from '@/types/neuland-api'
import {
	convertRelevantAllergens,
	convertRelevantFlags,
	formatPrice,
	getUserSpecificLabel,
	getUserSpecificPrice,
	humanLocations,
	mealName,
	shareMeal
} from '@/utils/food-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

export const MealEntry = memo(({ meal }: { meal: Meal }): React.JSX.Element => {
	const preferencesSelection = useFoodFilterStore(
		(state) => state.preferencesSelection
	)
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	)
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)

	const deferredPreferences = useDeferredValue(preferencesSelection)
	const deferredAllergens = useDeferredValue(allergenSelection)
	const deferredFoodLanguage = useDeferredValue(foodLanguage)

	const { t, i18n } = useTranslation('food')
	const notificationColor = toColor(useCSSVariable('--color-notification'))
	const vegGreenColor = toColor(useCSSVariable('--color-veg-green'))

	const userAllergens = useMemo(
		() =>
			convertRelevantAllergens(
				meal.allergens ?? [],
				deferredAllergens,
				i18n.language
			),
		[meal.allergens, deferredAllergens, i18n.language]
	)
	const { userKind = USER_GUEST } = use<UserKindContextType>(UserKindContext)
	const userFlags = useMemo(
		() =>
			convertRelevantFlags(
				meal.flags ?? [],
				deferredPreferences,
				i18n.language
			),
		[meal.flags, deferredPreferences, i18n.language]
	)
	const price = getUserSpecificPrice(meal, userKind ?? 'guest')
	const label = price !== '' ? getUserSpecificLabel(userKind ?? 'guest', t) : ''

	const isNotConfigured =
		deferredAllergens.length === 1 && deferredAllergens[0] === 'not-configured'
	const hasSelectedAllergens = deferredAllergens.length > 0 && !isNotConfigured
	const hasUserAllergens = userAllergens.length > 0 && !isNotConfigured
	const hasNoMealAllergens = hasSelectedAllergens && meal.allergens === null

	const shouldShowAllergens = hasUserAllergens || hasNoMealAllergens

	const iconName = hasUserAllergens ? 'exclamationmark.triangle' : 'info.circle'
	const androidName = hasUserAllergens ? 'warning' : 'info'
	const webName = hasUserAllergens ? 'TriangleAlert' : 'Info'
	const textContent = hasUserAllergens ? userAllergens : t('empty.noAllergens')

	const [key, setKey] = useState(Math.random())

	const itemPressed = (): void => {
		router.navigate({
			pathname: '/food/[id]',
			params: { id: meal.id }
		})
	}

	const cardContent = (
		<Link asChild href={`/food/${meal.id}`}>
			<Pressable
				delayLongPress={300}
				onLongPress={() => {
					/* nothing */
				}}
				className="mt-2.5"
			>
				<View
					className="self-center bg-card rounded-mg border-border p-card w-full"
					style={hairlineBorder}
				>
					<View className="flex-row items-start justify-between w-full">
						<Text
							className="text-text text-base font-medium max-w-[88%]"
							numberOfLines={2}
						>
							{mealName(
								meal.name,
								deferredFoodLanguage,
								i18n.language as LanguageKey
							)}
						</Text>
						{meal.variants?.length > 0 && (
							<View
								className="rounded-mg border-border bg-label-background max-w-[10%] px-1.5 py-0.5"
								style={hairlineBorder}
							>
								<Text className="text-text text-[11px] font-medium text-center">
									{`+ ${meal.variants.length}`}
								</Text>
							</View>
						)}
					</View>
					<View className="flex-row items-start justify-center pt-[3px]">
						<View className="flex-col flex-1 pt-0.5">
							<View className="flex-row flex-wrap">
								{userFlags.map(
									(
										flag: { name: string; isVeg: boolean },
										flagIndex: number
									) => (
										<View
											key={flagIndex}
											className="border-border bg-label-background rounded-mg flex-row items-center mb-0.5 mr-1"
											style={hairlineBorder}
										>
											{flag.isVeg && (
												<PlatformIcon
													ios={{
														name: 'leaf.fill',
														size: 13
													}}
													android={{
														name: 'eco',
														size: 13,
														variant: 'filled'
													}}
													web={{
														name: 'Leaf',
														size: 13,
														variant: 'filled'
													}}
													style={{
														color: vegGreenColor,
														alignSelf: 'center',
														marginLeft: 7,
														marginRight: -2
													}}
												/>
											)}

											<Text className="text-text text-xs px-1.5 py-0.5">
												{flag.name}
											</Text>
										</View>
									)
								)}
							</View>
							{shouldShowAllergens && (
								<View className="flex-row items-center gap-0.5 mt-1.5 w-[80%]">
									<PlatformIcon
										ios={{
											name: iconName,
											size: 13
										}}
										android={{
											name: androidName,
											size: 16,
											variant: 'outlined'
										}}
										web={{
											name: webName,
											size: 16
										}}
										style={{
											color: notificationColor,
											alignSelf: 'center',
											marginRight: 4
										}}
									/>
									<Text className="text-notification text-xs" numberOfLines={3}>
										{textContent}
									</Text>
								</View>
							)}
						</View>
						<View className="items-end self-end flex-col justify-end">
							<Text className="text-text text-sm font-medium self-end">
								{getUserSpecificPrice(meal, userKind ?? 'guest')}
							</Text>
							{label !== '' && (
								<Text className="text-label text-xs self-end">{label}</Text>
							)}
						</View>
					</View>
				</View>
			</Pressable>
		</Link>
	)

	if (Platform.OS === 'ios' && DeviceInfo.getDeviceType() !== 'Desktop') {
		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={t('details.share.message', {
					meal: meal.name[i18n.language as LanguageKey],
					price: formatPrice(meal.prices[userKind ?? 'guest']),
					location:
						humanLocations[meal.restaurant as keyof typeof humanLocations],
					id: meal.id
				})}
			>
				<ContextMenu
					title={humanLocations[meal.restaurant as keyof typeof humanLocations]}
					key={key}
					style={{ zIndex: 3 }}
					actions={[
						{
							title: meal.allergens?.join(', ') ?? t('empty.noAllergens'),
							subtitle:
								meal.allergens !== null
									? t('preferences.formlist.allergens')
									: undefined,
							systemIcon:
								Platform.OS === 'ios' ? 'exclamationmark.triangle' : undefined,
							disabled: true
						},
						{
							title: t('misc.share', { ns: 'common' }),
							systemIcon:
								Platform.OS === 'ios' ? 'square.and.arrow.up' : undefined
						}
					]}
					onPreviewPress={itemPressed}
					onPress={(e) => {
						if (e.nativeEvent.name === t('misc.share', { ns: 'common' })) {
							trackEvent('Share', {
								type: 'meal'
							})
							shareMeal(meal, i18n, userKind)
						}
						setKey(Math.random())
					}}
				>
					{cardContent}
				</ContextMenu>
			</DragDropView>
		)
	}

	return (
		<DragDropView
			mode="drag"
			scope="system"
			dragValue={t('details.share.message', {
				meal: meal.name[i18n.language as LanguageKey],
				price: formatPrice(meal.prices[userKind ?? 'guest']),
				location:
					humanLocations[meal.restaurant as keyof typeof humanLocations],
				id: meal.id
			})}
		>
			{cardContent}
		</DragDropView>
	)
})
