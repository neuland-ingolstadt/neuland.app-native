import {
	router,
	useFocusEffect,
	useLocalSearchParams,
	useNavigation
} from 'expo-router'
import type React from 'react'
import { use, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import {
	MealDetailStackHeader,
	useMealDetailScroll
} from '@/components/Food/meal-detail-header'
import { createMealPreferenceAlert } from '@/components/Food/meal-preference-alert'
import { MealPriceRow } from '@/components/Food/meal-price-row'
import FormList from '@/components/Universal/form-list'
import PlatformIcon from '@/components/Universal/icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { USER_GUEST } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { useMealDetail } from '@/hooks/useMealDetail'
import { useWiggleAnimation } from '@/hooks/useWiggleAnimation'
import type { LanguageKey } from '@/localization/i18n'
import { formatFriendlyDate } from '@/utils/date-utils'
import {
	capitalizeRestaurant,
	foodRestaurantLocations,
	mealName,
	shareMeal
} from '@/utils/food-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import {
	buildMealDetailSections,
	getMealHumanLocation,
	hasMealRestaurantLocation
} from '@/utils/meal-detail-sections'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

export default function FoodDetail(): React.JSX.Element {
	const { id } = useLocalSearchParams<{ id: string }>()
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const successColor = toColor(useCSSVariable('--color-success'))
	const notificationColor = toColor(useCSSVariable('--color-notification'))
	const warningColor = toColor(useCSSVariable('--color-warning'))

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
		queryData,
		isLoading,
		error,
		meal: foodData,
		date
	} = useMealDetail(id)
	const { scrollHandler, headerStyle } = useMealDetailScroll()
	const { iconAnimatedStyle: wiggleIconAnimatedStyle, triggerWiggle } =
		useWiggleAnimation()

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

	const language = i18n.language as LanguageKey
	const restaurant = capitalizeRestaurant(foodData.restaurant)
	const humanLocation = getMealHumanLocation(restaurant)
	const locationExists = hasMealRestaurantLocation(restaurant)

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

	const itemAlert = createMealPreferenceAlert({
		t,
		language,
		allergenSelection,
		preferencesSelection,
		toggleSelectedAllergens,
		toggleSelectedPreferences
	})

	const sections = buildMealDetailSections({
		foodData,
		t,
		language,
		userKind,
		restaurant,
		humanLocation,
		locationExists,
		preferencesSelection,
		allergenSelection,
		successColor,
		notificationColor,
		primaryColor,
		onItemAlert: itemAlert,
		onNavigateToRestaurant: handlePress
	})

	const title = mealName(foodData.name, foodLanguage, language)

	const isTranslated = (): boolean => {
		if (foodLanguage !== 'default') {
			return foodLanguage === 'de'
		}
		return i18n.language === 'de'
	}

	return (
		<Animated.ScrollView
			contentContainerClassName="mx-page pb-bottom-safe"
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<MealDetailStackHeader title={title} headerStyle={headerStyle} />
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
				{date && (
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
							{formatFriendlyDate(date)}
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

			<MealPriceRow prices={foodData.prices} userKind={userKind} />

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
