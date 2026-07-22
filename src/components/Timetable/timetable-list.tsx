import {
	FlashList,
	type ListRenderItemInfo,
	type FlashList as ShopifyFlashList
} from '@shopify/flash-list'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import type React from 'react'
import {
	startTransition,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef
} from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import { lightTheme } from '@/styles/themes'
import type { ITimetableViewProps } from '@/types/timetable'
import type { ExamEntry, FriendlyTimetableEntry } from '@/types/utils'
import { formatISODate } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'
import { HeaderRight } from './header-buttons'
import TimetableCalendarEntry from './timetable-calendar-entry'
import TimetableExamEntry from './timetable-exam-entry'
import TimetableLectureEntry from './timetable-lecture-entry'
import TimetableSectionHeader from './timetable-section-header'
import {
	type FlatListItem,
	getTimetableFlatListKey,
	type TimetableItem,
	useTimetableFlatSections
} from './use-timetable-flat-sections'

const AnimatedTimetableItem = ({
	item,
	renderContent
}: {
	item: TimetableItem
	renderContent: (item: TimetableItem) => React.ReactNode
}) => {
	return <View>{renderContent(item)}</View>
}

export default function TimetableList({
	timetable,
	exams
}: ITimetableViewProps): React.JSX.Element {
	const today = useMemo(() => {
		const d = new Date()
		d.setHours(0, 0, 0, 0)
		return d
	}, [])

	const router = useRouter()
	const navigation = useNavigation()
	const listRef = useRef<ShopifyFlashList<FlatListItem>>(null)
	const { t } = useTranslation('timetable')
	const { theme } = useUniwind()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)
	const calendarItemColor = String(
		toColor(useCSSVariable('--color-calendar-item')) ?? '#5d5d5d'
	)
	const listThemeData = {
		primaryColor,
		notificationColor,
		calendarItemColor
	}
	const showExams = useTimetableStore((state) => state.showExams)
	const showCalendarEvents = useTimetableStore(
		(state) => state.showCalendarEvents
	)
	const hasPendingUpdate = useTimetableStore(
		(state) => state.hasPendingTimetableUpdate
	)
	const setHasPendingUpdate = useTimetableStore(
		(state) => state.setHasPendingTimetableUpdate
	)
	const setSelectedLecture = useRouteParamsStore(
		(state) => state.setSelectedLecture
	)
	const setSelectedExam = useRouteParamsStore((state) => state.setSelectedExam)

	useFocusEffect(
		useCallback(() => {
			if (hasPendingUpdate) {
				startTransition(() => {
					setHasPendingUpdate(false)
				})
			}
		}, [hasPendingUpdate])
	)

	const { flatData } = useTimetableFlatSections({
		timetable,
		exams,
		showExams,
		showCalendarEvents,
		today
	})

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderRight
					setToday={() => {
						const todayIndex = flatData.findIndex(
							(item) =>
								item.type === 'header' &&
								formatISODate(item.title) === formatISODate(today)
						)

						if (todayIndex !== -1 && listRef.current) {
							listRef.current.scrollToIndex({
								index: todayIndex,
								animated: true,
								viewPosition: 0
							})
						} else if (listRef.current) {
							listRef.current.scrollToOffset({ offset: 0, animated: true })
						}
					}}
					onPressPreferences={() => router.navigate('/timetable-preferences')}
				/>
			)
		})
	}, [navigation, flatData, today, router])

	if (hasPendingUpdate) {
		return (
			<View style={pendingStyles.container}>
				<LoadingIndicator />
			</View>
		)
	}

	const showEventDetails = (entry: FriendlyTimetableEntry): void => {
		setSelectedLecture(entry)
		router.navigate('/lecture')
	}

	const showExamDetails = (exam: ExamEntry): void => {
		setSelectedExam(exam)
		router.navigate('/exam')
	}

	const renderItem = ({
		item
	}: ListRenderItemInfo<FlatListItem>): React.JSX.Element | null => {
		if (item.type === 'header') {
			return <TimetableSectionHeader title={item.title} today={today} />
		}

		if (item.type === 'item') {
			const data = item.data

			const renderContent = (data: TimetableItem) => {
				if (data.eventType === 'exam') {
					return (
						<TimetableExamEntry
							exam={data}
							notificationColor={notificationColor}
							onPress={showExamDetails}
						/>
					)
				}
				if (data.eventType === 'calendar') {
					return (
						<TimetableCalendarEntry
							item={data}
							calendarItemColor={calendarItemColor}
						/>
					)
				}
				return (
					<TimetableLectureEntry
						item={data}
						primaryColor={primaryColor}
						onPress={showEventDetails}
					/>
				)
			}

			return <AnimatedTimetableItem item={data} renderContent={renderContent} />
		}

		return null
	}

	return (
		<>
			{flatData.length === 0 ? (
				<ErrorView
					title={t('error.filtered.title')}
					message={t('error.filtered.message')}
					icon={{
						ios: 'fireworks',
						android: 'celebration',
						web: 'PartyPopper'
					}}
					isCritical={false}
				/>
			) : (
				<FlashList
					key={`flashlist-${theme}`}
					ref={listRef}
					style={listStyles.list}
					data={flatData}
					extraData={listThemeData}
					renderItem={renderItem}
					contentContainerStyle={listStyles.contentContainer}
					estimatedItemSize={100}
					keyExtractor={getTimetableFlatListKey}
					viewabilityConfig={{
						itemVisiblePercentThreshold: 10
					}}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</>
	)
}

const listStyles = StyleSheet.create({
	list: {
		flex: 1
	},
	contentContainer: {
		paddingBottom: 80,
		paddingHorizontal: lightTheme.margins.page
	}
})

const pendingStyles = StyleSheet.create({
	container: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center'
	}
})
