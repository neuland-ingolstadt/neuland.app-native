/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO */
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
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import { FoodLoadingIndicator, MealDay } from '@/components/Food'
import { AllergensBanner } from '@/components/Food/allergens-banner'
import PagerView from '@/components/Layout/pager-view'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { Food } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { formatISODate } from '@/utils/date-utils'
import { loadFoodEntries } from '@/utils/food-utils'
import { pausedToast } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

function getRenderableFoodDays(foodData?: Food[]): Food[] {
	if (foodData == null) {
		return []
	}

	const todayStart = new Date().setHours(0, 0, 0, 0)
	return foodData
		.filter((day) => new Date(day.timestamp).getTime() >= todayStart)
		.slice(0, 5)
}

function FoodScreen(): React.JSX.Element {
	const autoShowNextDay = usePreferencesStore((state) => state.autoShowNextDay)
	const autoShowNextDayTimeMinutes = usePreferencesStore(
		(state) => state.autoShowNextDayTimeMinutes
	)
	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const showStatic = useFoodFilterStore((state) => state.showStatic)
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	)
	const pagerViewRef = useRef<PagerView>(null)
	const borderColor = useCSSVariable('--color-border')

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
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24
	})
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	const getInitialPage = useCallback((): number => {
		if (!autoShowNextDay) return 0
		const renderableDays = getRenderableFoodDays(foodData)

		const today = new Date()
		const currentTimeMinutes = today.getHours() * 60 + today.getMinutes()

		if (
			currentTimeMinutes >= autoShowNextDayTimeMinutes &&
			renderableDays.length > 1
		) {
			const firstDayTimestamp = renderableDays[0].timestamp
			const firstDayIso =
				typeof firstDayTimestamp === 'string'
					? firstDayTimestamp.slice(0, 10)
					: formatISODate(firstDayTimestamp)
			const isToday = firstDayIso === formatISODate(today)

			if (isToday) {
				return 1
			}
		}
		return 0
	}, [autoShowNextDay, autoShowNextDayTimeMinutes, foodData])

	const [selectedDay, setSelectedDay] = useState<number>(getInitialPage())
	const initialPageRef = useRef<number>(getInitialPage())

	useEffect(() => {
		if (foodData == null) {
			return
		}

		const filteredDays = getRenderableFoodDays(foodData)
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

	const DayButton = memo(
		({ day, index }: { day: Food; index: number }): React.JSX.Element => {
			const date = new Date(day.timestamp)

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

			const isSelected = selectedDay === index

			return (
				<View style={buttonStyle} key={index}>
					<Pressable
						onPress={() => {
							handleDayPress(index)
						}}
					>
						<View
							className="items-center self-center bg-card rounded-md border border-border h-[60px] justify-evenly py-2 w-full"
							style={hairlineBorder}
						>
							<Text
								className={`text-[15px] ${isSelected ? 'text-primary font-medium' : 'text-text font-normal'}`}
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
								className={`text-base ${isSelected ? 'text-primary font-medium' : 'text-text font-normal'}`}
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

	const scrollY = new Animated.Value(0)
	const showAllergensBanner =
		deferredAllergenSelection.length === 1 &&
		deferredAllergenSelection[0] === 'not-configured'

	return (
		<SafeAreaProvider>
			<SafeAreaView className="flex-1" edges={['top']}>
				{isLoading && !isRefetchingByUser ? (
					<View className="items-center justify-center pt-20 pb-10">
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
							className="w-full"
							style={{
								borderBottomColor: toColor(borderColor),
								borderBottomWidth: showAllergensBanner
									? 0
									: scrollY.interpolate({
											inputRange: [0, 0, 0],
											outputRange: [0, 0, 0.5],
											extrapolate: 'clamp'
										})
							}}
						>
							<View className="flex-row justify-between mx-3 my-2.5">
								{data.slice(0, 5).map((day: Food, index: number) => (
									<DayButton day={day} index={index} key={index} />
								))}
							</View>
						</Animated.View>
						{showAllergensBanner && <AllergensBanner scrollY={scrollY} />}
						<PagerView
							ref={pagerViewRef}
							className="flex-1"
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
									contentContainerClassName="mx-3 pb-bottom-safe"
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
