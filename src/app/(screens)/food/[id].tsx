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
	StyleSheet,
	Text,
	View
} from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import FormList from '@/components/Universal/form-list'
import PlatformIcon, { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import ShareHeaderButton from '@/components/Universal/share-header-button'
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
import { copyToClipboard } from '@/utils/ui-utils'

export default function FoodDetail(): React.JSX.Element {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { styles, theme } = useStyles(stylesheet)

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
	const dataSources = {
		IngolstadtMensa: 'https://www.werkswelt.de/?id=ingo',
		NeuburgMensa: 'https://www.werkswelt.de/?id=mtneuburg',
		Reimanns: 'http://reimanns.in/mittagsgerichte-wochenkarte/',
		Canisius: 'http://www.canisiusstiftung.de/upload/speiseplan.pdf'
	}

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
					headerRight: () => undefined
				})
			} else {
				navigation.setOptions({
					headerRight: () => (
						<ShareHeaderButton
							onPress={() => {
								shareMeal(foodData, i18n, userKind)
							}}
						/>
					)
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
			<View style={styles.loadingContainer}>
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

	interface Locations {
		IngolstadtMensa: string
		Reimanns: string
		Canisius: string
		[key: string]: string
	}

	const locations: Locations = {
		IngolstadtMensa: 'M001',
		Reimanns: 'F001',
		Canisius: 'X001'
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
					iconColor: theme.colors.success,
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
						iconColor: theme.colors.notification,
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
		const location = locations[restaurant as keyof typeof locations]

		if (restaurant != null && location !== undefined) {
			router.dismissTo({
				pathname: '/(tabs)/map',
				params: { room: location }
			})
		}
	}

	const locationExists =
		restaurant !== undefined && locations[restaurant] !== undefined
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
					title: 'Restaurant',
					value: humanLocation,
					onPress: handlePress,
					textColor: locationExists ? theme.colors.primary : undefined,
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
								foodData?.restaurant as keyof typeof dataSources
							void Linking.openURL(dataSources[restaurant])
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
			contentContainerStyle={styles.page}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{title}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit={true}
					numberOfLines={3}
					minimumFontScale={0.8}
					selectable={true}
				>
					{title}
				</Text>
			</View>

			<View style={styles.tagsContainer}>
				{mealWithDate?.date && (
					<View style={styles.tagContainer}>
						<PlatformIcon
							ios={{
								name: 'calendar',
								variant: 'fill',
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
							style={styles.tagIcon}
						/>
						<Text style={styles.tagText}>
							{formatFriendlyDate(mealWithDate.date)}
						</Text>
					</View>
				)}

				<Pressable style={styles.tagContainer} onPress={handlePress}>
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
						style={styles.tagIcon}
					/>
					<Text style={styles.tagText}>{humanLocation}</Text>
				</Pressable>
			</View>

			{isPriceAvailable && (
				<View style={styles.pricesContainer}>
					<View
						style={[
							styles.priceCard,
							userKind === USER_STUDENT && styles.priceCardActive
						]}
					>
						<Text style={styles.priceLabel}>
							{t('details.formlist.prices.student')}
						</Text>
						<Text
							style={[
								styles.priceValue,
								userKind === USER_STUDENT && styles.priceValueActive
							]}
						>
							{studentPrice}
						</Text>
					</View>
					<View
						style={[
							styles.priceCard,
							userKind === USER_EMPLOYEE && styles.priceCardActive
						]}
					>
						<Text style={styles.priceLabel}>
							{t('details.formlist.prices.employee')}
						</Text>
						<Text
							style={[
								styles.priceValue,
								userKind === USER_EMPLOYEE && styles.priceValueActive
							]}
						>
							{employeePrice}
						</Text>
					</View>
					<View
						style={[
							styles.priceCard,
							userKind === USER_GUEST && styles.priceCardActive
						]}
					>
						<Text style={styles.priceLabel}>
							{t('details.formlist.prices.guest')}
						</Text>
						<Text
							style={[
								styles.priceValue,
								userKind === USER_GUEST && styles.priceValueActive
							]}
						>
							{guestPrice}
						</Text>
					</View>
				</View>
			)}

			<View style={styles.formList}>
				<FormList sections={sections} />
			</View>

			<Pressable onPress={triggerWiggle}>
				<View style={styles.notesContainer}>
					<View style={styles.notesBox}>
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
								style={styles.iconWarning}
							/>
						</Animated.View>
						<Text style={styles.notesText}>
							{!isTranslated() ? t('details.translated') : ''}
							{t('details.footer')}
						</Text>
					</View>
				</View>
			</Pressable>
		</Animated.ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	formList: {
		alignSelf: 'center',
		marginVertical: 16,
		width: '100%'
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	iconWarning: {
		color: theme.colors.warning
	},
	notesBox: {
		alignContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		flexDirection: 'row',
		gap: 16,
		paddingHorizontal: 14,
		paddingVertical: 8,
		width: '100%',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	notesContainer: {
		alignSelf: 'center',
		marginBottom: theme.margins.bottomSafeArea,
		marginTop: 20,
		paddingHorizontal: 4
	},
	notesText: {
		color: theme.colors.labelColor,
		flex: 1,
		flexShrink: 1,
		fontSize: 11,
		fontWeight: 'normal',
		textAlign: 'left'
	},
	page: {
		marginHorizontal: theme.margins.page
	},
	subtitleText: {
		color: theme.colors.labelColor,
		fontSize: 16,
		fontWeight: '600'
	},
	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingBottom: 6
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 22,
		fontWeight: '700',
		paddingTop: 16,
		textAlign: 'left'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	tagsContainer: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
		alignItems: 'center'
	},
	tagContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: theme.colors.card,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: theme.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	tagIcon: {
		color: theme.colors.primary
	},
	tagText: {
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '500'
	},
	pricesContainer: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16
	},
	priceCard: {
		flex: 1,
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		padding: 12,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	priceCardActive: {
		backgroundColor: `${theme.colors.primary}15`,
		borderColor: theme.colors.primary
	},
	priceLabel: {
		color: theme.colors.labelColor,
		fontSize: 12,
		marginBottom: 4,
		textAlign: 'center'
	},
	priceValue: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center'
	},
	priceValueActive: {
		color: theme.colors.primary
	}
}))
