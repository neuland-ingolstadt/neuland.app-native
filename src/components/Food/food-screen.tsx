/** biome-ignore-all lint/correctness/useHookAtTopLevel: TOOD */
import { useQuery } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import {
	memo,
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'
import {
	Animated,
	Dimensions,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import { FoodLoadingIndicator, MealDay } from '@/components/Food'
import { AllergensBanner } from '@/components/Food/allergens-banner'
import PagerView from '@/components/Layout/pager-view'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { Food } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { loadFoodEntries } from '@/utils/food-utils'
import { pausedToast } from '@/utils/ui-utils'

function FoodScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const autoShowNextDay = usePreferencesStore((state) => state.autoShowNextDay)
	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const showStatic = useFoodFilterStore((state) => state.showStatic)
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	)
	const autoShowNextDayHour = 18

	// Use deferredValue for filtering states to prevent UI blocking during expensive updates
	const deferredSelectedRestaurants = useDeferredValue(selectedRestaurants)
	const deferredShowStatic = useDeferredValue(showStatic)
	const deferredAllergenSelection = useDeferredValue(allergenSelection)

	const [data, setData] = useState<Food[]>([])
	const { t, i18n } = useTranslation('common')
	const {
		data: foodData,
		error,
		isLoading,
		isError,
		isPaused,
		isSuccess,
		refetch
	} = useQuery({
		queryKey: ['meals', deferredSelectedRestaurants, deferredShowStatic],
		queryFn: async () =>
			await loadFoodEntries(deferredSelectedRestaurants, deferredShowStatic),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	const getInitialPage = useCallback((): number => {
		if (!autoShowNextDay) return 0

		const currentHour = new Date().getHours()

		if (currentHour >= autoShowNextDayHour && foodData && foodData.length > 1) {
			return 1
		}
		return 0
	}, [autoShowNextDay, foodData])

	const [selectedDay, setSelectedDay] = useState<number>(getInitialPage())
	const initialPageRef = useRef<number>(getInitialPage())

	useEffect(() => {
		if (foodData == null) {
			return
		}
		const filteredDays = foodData
			.filter(
				(day) =>
					new Date(day.timestamp).getTime() >= new Date().setHours(0, 0, 0, 0)
			) // filter again in case of yesterday's cached data
			.slice(0, 5)
		if (filteredDays.length === 0) {
			throw new Error('noMeals')
		}

		setData(filteredDays)
		const initialPage = getInitialPage()
		initialPageRef.current = initialPage
		setSelectedDay(initialPage)
		if (pagerViewRef.current) {
			pagerViewRef.current.setPage(initialPage)
		}
	}, [foodData, getInitialPage])

	useEffect(() => {
		if (isPaused && data != null) {
			pausedToast()
		}
	}, [data, isPaused, t])

	const pagerViewRef = useRef<PagerView>(null)

	/**
	 * Renders a button for a specific day's food data.
	 * @param {Food} day - The food data for the day.
	 * @param {number} index - The index of the day in the list of days.
	 * @returns {JSX.Element} - The rendered button component.
	 */
	const DayButton = memo(
		({ day, index }: { day: Food; index: number }): React.JSX.Element => {
			const date = new Date(day.timestamp)
			const { styles } = useStyles(stylesheet)

			const daysCnt = data != null ? (data.length < 5 ? data.length : 5) : 0
			const isFirstDay = index === 0
			const isLastDay = index === daysCnt - 1

			const buttonStyle = [
				{ flex: 1, marginHorizontal: 4 },
				isFirstDay ? { marginLeft: 0 } : null,
				isLastDay ? { marginRight: 0 } : null
			]

			const setPage = useCallback((page: number): void => {
				pagerViewRef.current?.setPage(page)
			}, [])

			const handleDayPress = useCallback(
				(index: number) => {
					if (Platform.OS === 'ios' && index !== selectedDay) {
						void Haptics.selectionAsync()
					}
					setSelectedDay(index)
					setPage(index)
				},
				[selectedDay, setPage]
			)
			const getStyleMemoized = useCallback(
				(isSelected: boolean) => styles.dayText2(isSelected),
				[]
			)
			return (
				<View style={buttonStyle} key={index}>
					<Pressable
						onPress={() => {
							handleDayPress(index)
						}}
					>
						<View style={styles.dayButtonContainer}>
							<Text
								style={getStyleMemoized(selectedDay === index)}
								adjustsFontSizeToFit
								minimumFontScale={0.8}
								numberOfLines={1}
							>
								{date
									.toLocaleDateString(i18n.language, {
										weekday: 'short'
									})
									.slice(0, 2)}
							</Text>
							<Text
								style={styles.dayText(selectedDay === index)}
								adjustsFontSizeToFit
								minimumFontScale={0.8}
								numberOfLines={1}
							>
								{date.toLocaleDateString('de-DE', {
									day: 'numeric',
									month: 'numeric'
								})}
							</Text>
						</View>
					</Pressable>
				</View>
			)
		}
	)

	const screenHeight = Dimensions.get('window').height
	const scrollY = new Animated.Value(0)
	const showAllergensBanner =
		deferredAllergenSelection.length === 1 &&
		deferredAllergenSelection[0] === 'not-configured'

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.page} edges={['top']}>
				{isLoading && !isRefetchingByUser ? (
					<View style={styles.loadingContainer}>
						<FoodLoadingIndicator size={140} />
					</View>
				) : isError ? (
					<ErrorView
						title={
							error.message === 'noMeals'
								? t('error.noMeals')
								: (error.message ?? t('error.title'))
						}
						onRefresh={refetchByUser}
						refreshing={isRefetchingByUser}
					/>
				) : isPaused && !isSuccess ? (
					<ErrorView
						title={networkError}
						onRefresh={refetchByUser}
						refreshing={isRefetchingByUser}
					/>
				) : isSuccess && data.length > 0 ? (
					<>
						<Animated.View
							style={{
								...styles.animtedContainer,

								borderBottomWidth: showAllergensBanner
									? 0
									: scrollY.interpolate({
											inputRange: [0, 0, 0],
											outputRange: [0, 0, 0.5],
											extrapolate: 'clamp'
										})
							}}
						>
							<View
								style={{
									...styles.loadedContainer
								}}
							>
								{data.slice(0, 5).map((day: Food, index: number) => (
									<DayButton day={day} index={index} key={index} />
								))}
							</View>
						</Animated.View>
						{showAllergensBanner && <AllergensBanner scrollY={scrollY} />}
						<PagerView
							ref={pagerViewRef}
							style={{
								...styles.page,
								height: screenHeight
							}}
							initialPage={initialPageRef.current}
							onPageSelected={(e) => {
								const page = e.nativeEvent.position
								setSelectedDay(page)
							}}
							scrollEnabled
							overdrag
						>
							{data.map((_: unknown, index: number) => (
								<ScrollView
									refreshControl={
										<RefreshControl
											refreshing={isRefetchingByUser}
											onRefresh={() => {
												void refetchByUser()
											}}
										/>
									}
									scrollEventThrottle={16}
									onScroll={Animated.event(
										[
											{
												nativeEvent: {
													contentOffset: {
														y: scrollY
													}
												}
											}
										],
										{ useNativeDriver: false }
									)}
									key={index}
									showsVerticalScrollIndicator={false}
									contentContainerStyle={styles.innerScrollContainer}
								>
									<MealDay day={data[index]} index={index} key={index} />
								</ScrollView>
							))}
						</PagerView>
					</>
				) : null}
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default FoodScreen

export const stylesheet = createStyleSheet((theme) => ({
	animtedContainer: {
		borderBottomColor: theme.colors.border,
		width: '100%'
	},
	dayButtonContainer: {
		alignContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		height: 60,
		justifyContent: 'space-evenly',
		paddingVertical: 8,
		width: '100%'
	},
	dayText: (selected: boolean) => ({
		color: selected ? theme.colors.primary : theme.colors.text,
		fontSize: 16,
		fontWeight: selected ? '500' : 'normal'
	}),
	dayText2: (selected: boolean) => ({
		color: selected ? theme.colors.primary : theme.colors.text,
		fontSize: 15,
		fontWeight: selected ? '500' : 'normal'
	}),
	innerScrollContainer: {
		marginHorizontal: 12,
		paddingBottom: theme.margins.bottomSafeArea
	},
	loadedContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginHorizontal: 12,
		marginVertical: 10
	},

	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 80,
		paddingBottom: 40
	},
	page: {
		flex: 1
	}
}))
