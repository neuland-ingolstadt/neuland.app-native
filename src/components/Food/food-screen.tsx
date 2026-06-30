import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import {
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import { FoodLoadingIndicator, MealDay } from '@/components/Food'
import { AllergensBanner } from '@/components/Food/allergens-banner'
import { FoodDayButton } from '@/components/Food/food-day-button'
import PagerView from '@/components/Layout/pager-view'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { Food } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { formatISODate } from '@/utils/date-utils'
import { loadFoodEntries } from '@/utils/food-utils'
import { pausedToast } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

function getFoodDayKey(day: Food): string {
	return typeof day.timestamp === 'string'
		? day.timestamp.slice(0, 10)
		: formatISODate(day.timestamp)
}

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
	const borderColor = toColor(useCSSVariable('--color-border'))
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

	const handleDayPress = useCallback((index: number) => {
		setSelectedDay(index)
		pagerViewRef.current?.setPage(index)
	}, [])

	const daysCount = data.length < 5 ? data.length : 5
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
								borderBottomColor: borderColor,
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
									<FoodDayButton
										key={getFoodDayKey(day)}
										day={day}
										index={index}
										selectedDay={selectedDay}
										daysCount={daysCount}
										language={i18n.language}
										onDayPress={handleDayPress}
									/>
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
							{data.map((day: Food, index: number) => (
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
									key={getFoodDayKey(day)}
									showsVerticalScrollIndicator={false}
									contentContainerClassName="mx-3 pb-bottom-safe"
								>
									<MealDay day={day} index={index} />
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
