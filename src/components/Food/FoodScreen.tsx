import ErrorView from '@/components/Error/ErrorView';
import { MealDay } from '@/components/Food';
import { AllergensBanner } from '@/components/Food/AllergensBanner';
import PagerView from '@/components/Layout/PagerView';
import LoadingIndicator from '@/components/Universal/LoadingIndicator';
import { useRefreshByUser } from '@/hooks';
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore';
import type { Food } from '@/types/neuland-api';
import { networkError } from '@/utils/api-utils';
import { loadFoodEntries } from '@/utils/food-utils';
import { pausedToast } from '@/utils/ui-utils';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Animated,
	Dimensions,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

function FoodScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet);
	const [selectedDay, setSelectedDay] = useState<number>(0);
	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	);
	const showStatic = useFoodFilterStore((state) => state.showStatic);
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	);

	const [data, setData] = useState<Food[]>([]);
	const { t, i18n } = useTranslation('common');
	const {
		data: foodData,
		error,
		isLoading,
		isError,
		isPaused,
		isSuccess,
		refetch
	} = useQuery({
		queryKey: ['meals', selectedRestaurants, showStatic],
		queryFn: async () => await loadFoodEntries(selectedRestaurants, showStatic),
		staleTime: 1000 * 60 * 0, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	});
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

	useEffect(() => {
		if (foodData == null) {
			return;
		}
		const filteredDays = foodData
			.filter(
				(day) =>
					new Date(day.timestamp).getTime() >= new Date().setHours(0, 0, 0, 0)
			) // filter again in case of yesterday's cached data
			.slice(0, 5);
		if (filteredDays.length === 0) {
			throw new Error('noMeals');
		}

		setData(filteredDays);
	}, [foodData]);

	useEffect(() => {
		if (isPaused && data != null) {
			pausedToast();
		}
	}, [data, isPaused, t]);

	const pagerViewRef = useRef<PagerView>(null);

	/**
	 * Renders a button for a specific day's food data.
	 * @param {Food} day - The food data for the day.
	 * @param {number} index - The index of the day in the list of days.
	 * @returns {JSX.Element} - The rendered button component.
	 */
	const DayButton = memo(
		({ day, index }: { day: Food; index: number }): React.JSX.Element => {
			const date = new Date(day.timestamp);
			const { styles } = useStyles(stylesheet);

			const daysCnt = data != null ? (data.length < 5 ? data.length : 5) : 0;
			const isFirstDay = index === 0;
			const isLastDay = index === daysCnt - 1;

			const buttonStyle = [
				{ flex: 1, marginHorizontal: 4 },
				isFirstDay ? { marginLeft: 0 } : null,
				isLastDay ? { marginRight: 0 } : null
			];

			const setPage = useCallback((page: number): void => {
				pagerViewRef.current?.setPage(page);
			}, []);

			const handleDayPress = useCallback(
				(index: number) => {
					if (Platform.OS === 'ios' && index !== selectedDay) {
						void Haptics.selectionAsync();
					}
					setSelectedDay(index);
					setPage(index);
				},
				[selectedDay, setPage]
			);
			const getStyleMemoized = useCallback(
				(isSelected: boolean) => styles.dayText2(isSelected),
				[]
			);
			return (
				<View style={buttonStyle} key={index}>
					<Pressable
						onPress={() => {
							handleDayPress(index);
						}}
					>
						<View style={styles.dayButtonContainer}>
							<Text
								style={getStyleMemoized(selectedDay === index)}
								adjustsFontSizeToFit={true}
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
								adjustsFontSizeToFit={true}
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
			);
		}
	);

	const screenHeight = Dimensions.get('window').height;
	const scrollY = new Animated.Value(0);
	const showAllergensBanner =
		allergenSelection.length === 1 && allergenSelection[0] === 'not-configured';

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.page} edges={['top']}>
				{isLoading && !isRefetchingByUser ? (
					<View style={styles.loadingContainer}>
						<LoadingIndicator />
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
							// eslint-disable-next-line react-native/no-inline-styles
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
							initialPage={0}
							onPageSelected={(e) => {
								const page = e.nativeEvent.position;
								setSelectedDay(page);
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
												void refetchByUser();
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
	);
}

export default FoodScreen;

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
		height: 60,
		justifyContent: 'space-evenly',
		paddingVertical: 8,
		shadowColor: theme.colors.text,
		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.1,
		shadowRadius: 1,
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
		paddingTop: 40
	},
	page: {
		flex: 1
	}
}));
