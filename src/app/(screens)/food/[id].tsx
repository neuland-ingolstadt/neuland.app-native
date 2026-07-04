import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import {
	router,
	Stack,
	useFocusEffect,
	useLocalSearchParams,
	useNavigation
} from 'expo-router'
import type React from 'react'
import { use, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	Share,
	Text,
	View
} from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import FormList from '@/components/Universal/form-list'
import PlatformIcon, { linkIcon } from '@/components/Universal/icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import allergenMap from '@/data/allergens.json'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import flagMap from '@/data/mensa-flags.json'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { useWiggleAnimation } from '@/hooks/useWiggleAnimation'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { Meal } from '@/types/neuland-api'
import { formatFriendlyDate } from '@/utils/date-utils'
import {
	formatPrice,
	humanLocations,
	loadFoodEntries,
	mealName,
	shareMeal
} from '@/utils/food-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { copyToClipboard } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

const foodDataSources = {
	IngolstadtMensa: 'https://www.werkswelt.de/?id=ingo',
	NeuburgMensa: 'https://www.werkswelt.de/?id=mtneuburg',
	Reimanns: 'https://reimanns.in/mittagsgerichte-wochenkarte/',
	Canisius:
		'https://www.canisiusstiftung.de/wp-content/uploads/Speiseplan/speiseplan.pdf'
} as const

interface FoodRestaurantLocations {
	IngolstadtMensa: string
	Reimanns: string
	Canisius: string
	[key: string]: string
}

const foodRestaurantLocations: FoodRestaurantLocations = {
	IngolstadtMensa: 'M001',
	Reimanns: 'F001',
	Canisius: 'X001'
}

export default function FoodDetail(): React.JSX.Element {
	const { id } = useLocalSearchParams<{ id: string }>()
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const successColor = toColor(useCSSVariable('--color-success'))
	const notificationColor = toColor(useCSSVariable('--color-notification'))
	const warningColor = toColor(useCSSVariable('--color-warning'))
	const primaryBackgroundColor = toColor(
		useCSSVariable('--color-primary-background')
	)

	const preferencesSelection = useFoodFilterStore(
		(state) => state.preferencesSelection
	)
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	)
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
	const toggleSelectedPreferences = useFoodFilterStore(
		(state) => state.toggleSelectedPreferences
	)
	const toggleSelectedAllergens = useFoodFilterStore(
		(state) => state.toggleSelectedAllergens
	)
	const { t, i18n } = useTranslation('food')
	const { userKind = USER_GUEST } = use(UserKindContext)

	const navigation = useNavigation()

	const {
		data: queryData,
		isLoading,
		error
	} = useQuery({
		queryKey: [
			'meals',
			['IngolstadtMensa', 'NeuburgMensa', 'Reimanns', 'Canisius'],
			true
		],
		queryFn: () =>
			loadFoodEntries(
				['IngolstadtMensa', 'NeuburgMensa', 'Reimanns', 'Canisius'],
				true
			),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})

	// Find both the meal and its parent Food object
	const mealWithDate = queryData?.reduce<{
		meal: Meal | undefined
		date: string | undefined
	}>(
		(acc, day) => {
			const meal = day.meals.find((m) => m.id === id)
			if (meal) {
				return { meal, date: day.timestamp.toString() }
			}
			return acc
		},
		{ meal: undefined, date: undefined }
	)

	const foodData = mealWithDate?.meal

	useFocusEffect(
		useCallback(() => {
			if (!foodData) {
				navigation.setOptions({
					...getPlatformHeaderButtons({})
				})
			} else {
				navigation.setOptions({
					...getPlatformHeaderButtons({
						onShare: () => {
							shareMeal(foodData, i18n, userKind)
						}
					})
				})
			}
		}, [foodData, i18n, userKind, navigation])
	)
	const scrollOffset = useSharedValue(0)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = event.contentOffset.y
			}
		}
	})

	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	const { iconAnimatedStyle: wiggleIconAnimatedStyle, triggerWiggle } =
		useWiggleAnimation()

	if (isLoading || !queryData) {
		return (
			<View className="flex-1 justify-center items-center">
				<LoadingIndicator />
			</View>
		)
	}

	if (error || !foodData) {
		return (
			<ErrorView
				title={t('details.error.title')}
				message={t('details.error.message')}
			/>
		)
	}

	function itemAlert(item: string, itemType: 'allergen' | 'flag'): void {
		const itemMap = itemType === 'allergen' ? allergenMap : flagMap
		const friendlyItem =
			itemMap[item as keyof typeof itemMap]?.[i18n.language as LanguageKey] ??
			item
		const isItemSelected = (
			itemType === 'allergen' ? allergenSelection : preferencesSelection
		).includes(item)

		if (Platform.OS === 'web') {
			if (
				!window.confirm(
					isItemSelected
						? t(
								// @ts-expect-error cannot verify the TFunktion type
								`details.formlist.alert.${itemType}.message.remove`,
								{
									[itemType]: friendlyItem
								}
							)
						: t(
								// @ts-expect-error cannot verify the TFunktion type
								`details.formlist.alert.${itemType}.message.add`,
								{
									[itemType]: friendlyItem
								}
							)
				)
			) {
				/* empty */
			} else {
				if (itemType === 'allergen') {
					toggleSelectedAllergens(item)
				} else if (itemType === 'flag') {
					toggleSelectedPreferences(item)
				}
			}
		} else {
			Alert.alert(
				t(`details.formlist.alert.${itemType}.title`),
				isItemSelected
					? t(
							// @ts-expect-error cannot verify the TFunktion type
							`details.formlist.alert.${itemType}.message.remove`,
							{
								[itemType]: friendlyItem
							}
						)
					: t(
							// @ts-expect-error cannot verify the TFunktion type
							`details.formlist.alert.${itemType}.message.add`,
							{
								[itemType]: friendlyItem
							}
						),
				[
					{
						text: t('misc.confirm', { ns: 'common' }),
						onPress: () => {
							if (itemType === 'allergen') {
								toggleSelectedAllergens(item)
							} else if (itemType === 'flag') {
								toggleSelectedPreferences(item)
							}
						}
					},
					{
						text: t('misc.cancel', { ns: 'common' }),
						onPress: () => {
							/* empty */
						},
						style: 'cancel'
					}
				]
			)
		}
	}

	const studentPrice = formatPrice(foodData?.prices?.student)
	const employeePrice = formatPrice(foodData?.prices?.employee)
	const guestPrice = formatPrice(foodData?.prices?.guest)
	const isPriceAvailable =
		studentPrice !== '' && employeePrice !== '' && guestPrice !== ''

	const isNutritionAvailable =
		foodData?.nutrition != null &&
		Object.values(foodData.nutrition).every(
			(value) => value !== '' && value !== 0
		)

	const nutritionSection: FormListSections[] = [
		{
			header: t('details.formlist.nutrition.title'),
			footer: t('details.formlist.nutrition.footer'),
			items: [
				{
					title: `${t('details.formlist.nutrition.energy')} (kJ)`,
					value: `${(foodData?.nutrition?.kj ?? 'n/a').toString()} kJ`,
					copyable: `${foodData?.nutrition?.kj}`
				},
				{
					title: `${t('details.formlist.nutrition.energy')} (kcal)`,
					value: `${(foodData?.nutrition?.kcal ?? 'n/a').toString()} kcal`,
					copyable: `${foodData?.nutrition?.kcal}`
				},
				{
					title: t('details.formlist.nutrition.fat'),
					value: `${(foodData?.nutrition?.fat ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.fat}`
				},
				{
					title: t('details.formlist.nutrition.saturated'),
					value: `${(foodData?.nutrition?.fatSaturated ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.fatSaturated}`
				},
				{
					title: t('details.formlist.nutrition.carbs'),
					value: `${(foodData?.nutrition?.carbs ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.carbs}`
				},
				{
					title: t('details.formlist.nutrition.sugar'),
					value: `${(foodData?.nutrition?.sugar ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.sugar}`
				},
				{
					title: t('details.formlist.nutrition.fiber'),
					value: `${(foodData?.nutrition?.fiber ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.fiber}`
				},
				{
					title: t('details.formlist.nutrition.protein'),
					value: `${(foodData?.nutrition?.protein ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.protein}`
				},
				{
					title: t('details.formlist.nutrition.salt'),
					value: `${(foodData?.nutrition?.salt ?? 'n/a').toString()} g`,
					copyable: `${foodData?.nutrition?.salt}`
				}
			]
		}
	]
	const mensaSection: FormListSections[] = [
		{
			header: t('preferences.formlist.flags'),
			items:
				foodData?.flags?.map((flag: string) => ({
					title:
						flagMap[flag as keyof typeof flagMap]?.[
							i18n.language as LanguageKey
						] ?? flag,
					icon: preferencesSelection.includes(flag)
						? {
								android: 'check_circle',
								ios: 'checkmark.seal',
								web: 'BadgeCheck',
								endIcon: true
							}
						: undefined,
					hideChevron: true,
					iconColor: successColor,
					onPress: () => {
						itemAlert(flag, 'flag')
					}
				})) ?? [],
			footer: t('details.formlist.flagsFooter')
		},
		{
			header: t('preferences.formlist.allergens'),
			items:
				(foodData?.allergens ?? [])
					.filter((allergen: string) =>
						Object.keys(allergenMap).includes(allergen)
					)
					.map((allergen: string) => ({
						title:
							allergenMap[allergen as keyof typeof allergenMap]?.[
								i18n.language as LanguageKey
							] ?? allergen,
						icon: allergenSelection.includes(allergen)
							? {
									android: 'warning',
									ios: 'exclamationmark.triangle',
									web: 'TriangleAlert',
									endIcon: true
								}
							: undefined,
						hideChevron: true,
						iconColor: notificationColor,
						onPress: () => {
							itemAlert(allergen, 'allergen')
						}
					})) ?? [],
			footer: t('details.formlist.allergenFooter', {
				allergens: foodData?.allergens?.join(', ')
			})
		},
		...(isNutritionAvailable ? nutritionSection : [])
	]

	const restaurant =
		foodData?.restaurant != null
			? foodData.restaurant.charAt(0).toUpperCase() +
				foodData.restaurant.slice(1)
			: ''
	const handlePress = (): void => {
		const location =
			foodRestaurantLocations[
				restaurant as keyof typeof foodRestaurantLocations
			]

		if (restaurant != null && location !== undefined) {
			router.dismissTo({
				pathname: '/(tabs)/map',
				params: { room: location }
			})
		}
	}

	const locationExists =
		restaurant !== undefined &&
		foodRestaurantLocations[restaurant] !== undefined
	const humanLocation =
		humanLocations[restaurant as keyof typeof humanLocations]
	const humanCategory = t(
		// @ts-expect-error cannot verify the TFunction type
		`categories.${foodData?.category}`
	) as string

	const aboutSection: FormListSections[] = [
		{
			header: t('details.formlist.about.title'),
			items: [
				{
					title: t('labels.restaurant', { ns: 'common' }),
					value: humanLocation,
					onPress: handlePress,
					textColor: locationExists ? primaryColor : undefined,
					disabled: !locationExists,
					icon: {
						ios: 'mappin.and.ellipse',
						android: 'place',
						web: 'MapPin'
					}
				},
				{
					title: t('details.formlist.about.category'),
					value: humanCategory,
					icon: {
						ios: 'tag',
						android: 'sell',
						web: 'Tag'
					}
				},
				{
					title: t('details.formlist.about.source'),
					icon: linkIcon,
					onPress: () => {
						if (foodData?.restaurant !== null) {
							const restaurant =
								foodData?.restaurant as keyof typeof foodDataSources
							void Linking.openURL(foodDataSources[restaurant])
						}
					}
				}
			]
		}
	]

	const variantsSection: FormListSections[] = [
		{
			header: t('details.formlist.variants'),
			items:
				foodData?.variants?.map((variant) => ({
					title: variant.name[i18n.language as LanguageKey],
					value:
						(variant?.additional ? '+ ' : '') +
						formatPrice(variant.prices[userKind ?? USER_GUEST]),
					onPress: () => {
						trackEvent('Share', {
							type: 'mealVariant'
						})
						const message = t('details.share.message', {
							meal: variant.name[i18n.language as LanguageKey],
							price: formatPrice(variant.prices[userKind ?? USER_GUEST]),
							location: restaurant,
							id: variant?.id
						})
						if (Platform.OS === 'web') {
							void copyToClipboard(message)
							return
						}
						void Share.share({
							message
						})
					}
				})) ?? []
		}
	]

	const isTranslated = (): boolean => {
		if (foodLanguage !== 'default') {
			return foodLanguage === 'de'
		}
		return i18n.language === 'de'
	}

	const sections: FormListSections[] =
		foodData?.restaurant === 'IngolstadtMensa' ||
		foodData?.restaurant === 'NeuburgMensa'
			? [...variantsSection, ...mensaSection, ...aboutSection]
			: [...variantsSection, ...aboutSection]

	const title = foodData
		? mealName(foodData.name, foodLanguage, i18n.language as LanguageKey)
		: ''

	return (
		<Animated.ScrollView
			contentContainerClassName="mx-page pb-bottom-safe"
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View
							className="overflow-hidden"
							style={{
								marginBottom: Platform.OS === 'ios' ? -10 : 0,
								paddingRight: Platform.OS === 'ios' ? 0 : 50
							}}
						>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={String(textColor)}>
									{title}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View className="flex-row items-start justify-between pb-1.5">
				<Text
					className="text-text flex-1 text-[22px] font-bold pt-4 text-left"
					adjustsFontSizeToFit={true}
					numberOfLines={3}
					minimumFontScale={0.8}
					selectable={true}
				>
					{title}
				</Text>
			</View>

			<View className="flex-row gap-2 mb-4 items-center">
				{mealWithDate?.date && (
					<View
						className="flex-row items-center gap-1.5 bg-card-sheet px-3 py-1.5 rounded-md border-border"
						style={hairlineBorder}
					>
						<PlatformIcon
							ios={{
								name: 'calendar',
								size: 13
							}}
							android={{
								name: 'calendar_today',
								size: 15
							}}
							web={{
								name: 'Calendar',
								size: 15
							}}
							style={{ color: primaryColor }}
						/>
						<Text className="text-text text-sm font-medium">
							{formatFriendlyDate(mealWithDate.date)}
						</Text>
					</View>
				)}

				<Pressable
					className="flex-row items-center gap-1.5 bg-card-sheet px-3 py-1.5 rounded-md border-border"
					style={hairlineBorder}
					onPress={handlePress}
				>
					<PlatformIcon
						ios={{
							name: 'mappin.and.ellipse',
							variant: 'fill',
							size: 13
						}}
						android={{
							name: 'place',
							size: 15
						}}
						web={{
							name: 'MapPin',
							size: 15
						}}
						style={{ color: primaryColor }}
					/>
					<Text className="text-text text-sm font-medium">{humanLocation}</Text>
				</Pressable>
			</View>

			{isPriceAvailable && (
				<View className="flex-row gap-2 mb-4">
					<View
						className="flex-1 bg-card-sheet rounded-md p-3 items-center border-border"
						style={[
							hairlineBorder,
							userKind === USER_STUDENT
								? {
										backgroundColor: primaryBackgroundColor,
										borderColor: primaryColor
									}
								: undefined
						]}
					>
						<Text className="text-label text-xs mb-1 text-center">
							{t('details.formlist.prices.student')}
						</Text>
						<Text
							className={`text-base font-semibold text-center ${
								userKind === USER_STUDENT ? 'text-primary' : 'text-text'
							}`}
						>
							{studentPrice}
						</Text>
					</View>
					<View
						className="flex-1 bg-card-sheet rounded-md p-3 items-center border-border"
						style={[
							hairlineBorder,
							userKind === USER_EMPLOYEE
								? {
										backgroundColor: primaryBackgroundColor,
										borderColor: primaryColor
									}
								: undefined
						]}
					>
						<Text className="text-label text-xs mb-1 text-center">
							{t('details.formlist.prices.employee')}
						</Text>
						<Text
							className={`text-base font-semibold text-center ${
								userKind === USER_EMPLOYEE ? 'text-primary' : 'text-text'
							}`}
						>
							{employeePrice}
						</Text>
					</View>
					<View
						className="flex-1 bg-card-sheet rounded-md p-3 items-center border-border"
						style={[
							hairlineBorder,
							userKind === USER_GUEST
								? {
										backgroundColor: primaryBackgroundColor,
										borderColor: primaryColor
									}
								: undefined
						]}
					>
						<Text className="text-label text-xs mb-1 text-center">
							{t('details.formlist.prices.guest')}
						</Text>
						<Text
							className={`text-base font-semibold text-center ${
								userKind === USER_GUEST ? 'text-primary' : 'text-text'
							}`}
						>
							{guestPrice}
						</Text>
					</View>
				</View>
			)}

			<View className="self-center my-4 w-full">
				<FormList sections={sections} sheet />
			</View>

			<Pressable onPress={triggerWiggle}>
				<View className="self-center mt-5 mb-bottom-safe px-1">
					<View
						className="flex-row items-center self-center bg-card-sheet rounded-md gap-4 px-3.5 py-2 w-full border-border"
						style={hairlineBorder}
					>
						<Animated.View style={wiggleIconAnimatedStyle}>
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
							{!isTranslated() ? t('details.translated') : ''}
							{t('details.footer')}
						</Text>
					</View>
				</View>
			</Pressable>
		</Animated.ScrollView>
	)
}
