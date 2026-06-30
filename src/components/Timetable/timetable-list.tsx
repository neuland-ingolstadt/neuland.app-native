import type {
	ListRenderItemInfo,
	FlashList as ShopifyFlashList
} from '@shopify/flash-list'
import Color from 'color'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import React, {
	startTransition,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef
} from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/drag-view'
import Badge from '@/components/Universal/badge'
import ColorBand from '@/components/Universal/color-band'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { FlashList } from '@/components/Universal/styled'
import TimeDisplay from '@/components/Universal/time-display'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import i18n from '@/localization/i18n'
import type { ITimetableViewProps } from '@/types/timetable'
import type {
	ExamEntry,
	FriendlyTimetableEntry,
	TimetableEntry
} from '@/types/utils'
import { calendar } from '@/utils/calendar-utils'
import {
	formatCompactDateRange,
	formatFriendlyDate,
	formatFriendlyDateTime,
	formatFriendlyTime,
	formatISODate
} from '@/utils/date-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import { HeaderRight } from './header-buttons'

type TimetableSection = {
	title: Date
	data: (TimetableEntry | ExamEntry | CalendarEntry)[]
}

type TimetableItem = TimetableEntry | ExamEntry | CalendarEntry

// Define type for the flattened list
type FlatListItem =
	| { type: 'header'; title: Date }
	| { type: 'item'; data: TimetableItem; originalIndex: number }

export type CalendarEntry = {
	id: string
	date: Date
	startDate: Date
	endDate: Date | null
	name:
		| {
				en?: string
				de?: string
				[key: string]: string | undefined
		  }
		| string
	isAllDay: boolean
	eventType: 'calendar'
	originalStartDate?: Date
	originalEndDate?: Date | null
}

export type FlashListItems = FriendlyTimetableEntry | Date | string

// Define a timetable item component without animations
const AnimatedTimetableItem = ({
	item,
	renderContent
}: {
	item: TimetableItem
	renderContent: (item: TimetableItem) => React.ReactNode
}) => {
	return <View>{renderContent(item)}</View>
}

// Create a separate component for section headers to properly use hooks
const SectionHeader = React.memo(
	({ section, today }: { section: TimetableSection; today: Date }) => {
		const primaryColor = toColor(useCSSVariable('--color-primary'))
		const textColor = toColor(useCSSVariable('--color-text'))
		const labelColor = toColor(useCSSVariable('--color-label'))
		const backgroundColor = toColor(useCSSVariable('--color-background'))

		const title = section.title
		const isToday = formatISODate(title) === formatISODate(today)
		const formattedDate = formatFriendlyDate(title, { weekday: 'long' })
		const dateParts = formattedDate.split(', ')

		return (
			<View className="py-1 z-10" style={{ backgroundColor }}>
				<View className="py-1.5 pt-page pb-1 mb-1">
					<View className="flex-row items-center justify-between">
						<View className="flex-col">
							<Text
								className="text-[19px] font-bold mb-0.5"
								style={{ color: isToday ? primaryColor : textColor }}
							>
								{dateParts[0]}
							</Text>
							{dateParts.length > 1 && (
								<Text
									className="text-sm"
									style={{
										color: isToday ? primaryColor : labelColor,
										fontWeight: isToday ? '600' : '400'
									}}
								>
									{dateParts[1]}
								</Text>
							)}
						</View>
						{isToday && (
							<View
								className="rounded-full me-1"
								style={{
									width: 8,
									height: 8,
									backgroundColor: primaryColor
								}}
							/>
						)}
					</View>
				</View>
			</View>
		)
	}
)

export default function TimetableList({
	timetable,
	exams
}: ITimetableViewProps): React.JSX.Element {
	/**
	 * Constants
	 */
	const today = useMemo(() => {
		const d = new Date()
		d.setHours(0, 0, 0, 0)
		return d
	}, [])

	/**
	 * Hooks
	 */
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

	// Reset pending update state when returning to the screen
	useFocusEffect(
		useCallback(() => {
			if (hasPendingUpdate) {
				startTransition(() => {
					setHasPendingUpdate(false)
				})
			}
		}, [hasPendingUpdate])
	)

	const examsList = showExams ? exams : []

	// Memoize the grouped and filtered timetable data
	const filteredTimetableSections = useMemo(() => {
		const grouped = getGroupedTimetable(
			timetable,
			examsList,
			showCalendarEvents,
			calendar
		)
		return grouped.filter((section) => section.title >= today)
	}, [timetable, examsList, showCalendarEvents, calendar, today])

	// Flatten the sections data for FlashList
	const flatData = useMemo(() => {
		const data: FlatListItem[] = []
		for (const section of filteredTimetableSections) {
			// Add header item
			data.push({ type: 'header', title: section.title })
			// Add data items
			let itemIndex = 0
			for (const item of section.data) {
				data.push({ type: 'item', data: item, originalIndex: itemIndex })
				itemIndex++
			}
		}
		return data
	}, [filteredTimetableSections])

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

	/**
	 * Constants
	 */
	if (hasPendingUpdate) {
		return (
			<View className="flex-1 justify-center items-center">
				<LoadingIndicator />
			</View>
		)
	}

	/**
	 * Functions
	 */
	function showEventDetails(entry: FriendlyTimetableEntry): void {
		setSelectedLecture(entry)
		router.navigate('/lecture')
	}

	function renderCalendarItem({
		item
	}: {
		item: CalendarEntry
	}): React.JSX.Element {
		const eventName =
			typeof item.name === 'object'
				? item.name[i18n.language as 'en' | 'de'] ||
					item.name.en ||
					item.name.de ||
					''
				: String(item.name || '')

		// Check if this is a multi-day event
		const isMultiDayEvent =
			item.originalEndDate &&
			item.originalStartDate &&
			new Date(item.originalEndDate).getTime() !==
				new Date(item.originalStartDate).getTime()

		// Format date for the info text using original dates for full span
		// Only show date range for multi-day events
		const infoText =
			isMultiDayEvent && item.originalStartDate
				? formatCompactDateRange(
						item.originalStartDate || item.startDate,
						item.originalEndDate || null
					)
				: ''

		// Time display or all day badge
		const timeElement = item.isAllDay ? (
			<Badge text={t('dates.allDay', { ns: 'common' })} type="allDay" />
		) : (
			<TimeDisplay
				startTime={formatFriendlyTime(item.startDate)}
				endTime={item.endDate ? formatFriendlyTime(item.endDate) : undefined}
			/>
		)
		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={`${eventName} (${infoText})`}
			>
				<Pressable
					onPress={() => {
						router.push({
							pathname: '/calendar',
							params: { event: item.id }
						})
					}}
					className="mb-2.5 rounded-md overflow-hidden"
					android_ripple={{
						color: Color(calendarItemColor).alpha(0.1).string()
					}}
				>
					<View
						className="flex-row bg-card rounded-md overflow-hidden min-h-[70px]"
						style={hairlineBorder}
					>
						<ColorBand color={calendarItemColor} />
						<View className="flex-1 p-3.5 relative">
							<View className="flex-row justify-between items-start mb-2">
								<Text
									className="text-[15.5px] font-semibold text-text flex-1 me-2"
									numberOfLines={1}
								>
									{eventName}
								</Text>
							</View>
							<View className="flex-row justify-between items-center mt-1">
								<View className="flex-row items-center gap-2.5">
									{infoText && (
										<Text className="text-sm text-label">{infoText}</Text>
									)}
									<Badge text="THI" type="calendar" />
								</View>
								{timeElement}
							</View>
						</View>
					</View>
				</Pressable>
			</DragDropView>
		)
	}

	function renderTimetableItem({
		item
	}: {
		item: FriendlyTimetableEntry
	}): React.JSX.Element {
		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={`${item.name} in ${item.rooms.join(
					', '
				)} (${formatFriendlyDateTime(
					item.startDate
				)} - ${formatFriendlyTime(item.endDate)})`}
			>
				<Pressable
					onPress={() => {
						showEventDetails(item)
					}}
					className="mb-2.5 rounded-md overflow-hidden"
					android_ripple={{
						color: Color(primaryColor).alpha(0.1).string()
					}}
				>
					<View
						className="flex-row bg-card rounded-md overflow-hidden min-h-[70px]"
						style={hairlineBorder}
					>
						<ColorBand color={primaryColor} />
						<View className="flex-1 p-3.5 relative">
							<View className="flex-row justify-between items-start mb-2">
								<Text
									className="text-[15.5px] font-semibold text-text flex-1 me-2"
									numberOfLines={1}
								>
									{item.name}
								</Text>
							</View>
							<View className="flex-row justify-between items-center mt-1">
								<View className="flex-row items-center">
									<Text className="text-sm text-label">
										{item.rooms.length > 0 ? item.rooms.join(', ') : ''}
									</Text>
								</View>
								<TimeDisplay
									startTime={formatFriendlyTime(item.startDate)}
									endTime={formatFriendlyTime(item.endDate)}
								/>
							</View>
						</View>
					</View>
				</Pressable>
			</DragDropView>
		)
	}

	function renderExamItem({ exam }: { exam: ExamEntry }): React.JSX.Element {
		const navigateToPage = (): void => {
			setSelectedExam(exam)
			router.navigate('/exam')
		}
		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={`${exam.name} in ${exam.rooms} (${formatFriendlyDateTime(exam.date)})`}
			>
				<Pressable
					onPress={() => {
						navigateToPage()
					}}
					className="mb-2.5 rounded-md overflow-hidden"
					android_ripple={{
						color: Color(notificationColor).alpha(0.1).string()
					}}
				>
					<View
						className="flex-row bg-card rounded-md overflow-hidden min-h-[70px]"
						style={hairlineBorder}
					>
						<ColorBand color={notificationColor} />
						<View className="flex-1 p-3.5 relative">
							<View className="flex-row justify-between items-start mb-2">
								<Text
									className="text-[15.5px] font-semibold text-text flex-1 me-2"
									numberOfLines={2}
								>
									{exam.name}
								</Text>
							</View>
							<View className="flex-row justify-between items-center mt-1">
								<View className="flex-row items-center gap-2">
									{(exam.seat ?? exam.rooms) != null && (
										<Text className="text-sm text-label">
											{exam.seat ?? exam.rooms}
										</Text>
									)}
									<Badge text="Exam" type="exam" />
								</View>
								<TimeDisplay
									startTime={formatFriendlyTime(exam.date)}
									endTime={formatFriendlyTime(exam.endDate)}
								/>
							</View>
						</View>
					</View>
				</Pressable>
			</DragDropView>
		)
	}

	function renderItem({
		item
	}: ListRenderItemInfo<FlatListItem>): React.JSX.Element | null {
		if (item.type === 'header') {
			// Render the section header component
			return (
				<SectionHeader
					section={{ title: item.title, data: [] }}
					today={today}
				/>
			)
		}

		if (item.type === 'item') {
			const data = item.data

			const renderContent = (data: TimetableItem) => {
				if (data.eventType === 'exam') {
					return renderExamItem({ exam: data })
				}
				if (data.eventType === 'calendar') {
					return renderCalendarItem({ item: data })
				}
				return renderTimetableItem({ item: data as FriendlyTimetableEntry })
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
				<FlashList<FlatListItem>
					key={`flashlist-${theme}`}
					ref={listRef}
					data={flatData}
					renderItem={renderItem}
					contentContainerClassName="pb-20 px-page"
					estimatedItemSize={100}
					keyExtractor={(item: FlatListItem, index: number) => {
						// Updated keyExtractor for FlatListItem
						const dateKeyPart = (date: Date | undefined | null): string => {
							return date instanceof Date && !Number.isNaN(date.getTime())
								? date.toISOString()
								: `invalid-date-${index}`
						}

						if (item.type === 'header') {
							return `header-${dateKeyPart(item.title)}`
						}

						// item.type === 'item'
						const data = item.data
						if (data.eventType === 'exam') {
							return `exam-${data.name}-${dateKeyPart(data.date)}`
						}
						if (data.eventType === 'calendar') {
							const eventName =
								typeof data.name === 'object'
									? JSON.stringify(data.name)
									: data.name
							return `calendar-${eventName}-${dateKeyPart(data.startDate)}`
						}

						// For timetable entries, use name, start date, and rooms
						const timetableItem = data as FriendlyTimetableEntry
						return `lecture-${timetableItem.name}-${dateKeyPart(timetableItem.startDate)}-${timetableItem.rooms?.join('-') ?? 'no-rooms'}`
					}}
					viewabilityConfig={{
						itemVisiblePercentThreshold: 10
					}}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</>
	)
}
