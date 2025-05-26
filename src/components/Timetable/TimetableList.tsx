import ErrorView from '@/components/Error/ErrorView'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/DragView'
import Badge from '@/components/Universal/Badge'
import ColorBand from '@/components/Universal/ColorBand'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import TimeDisplay from '@/components/Universal/TimeDisplay'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import type { ITimetableViewProps } from '@/types/timetable'
import type {
	ExamEntry,
	FriendlyTimetableEntry,
	TimetableEntry
} from '@/types/utils'
import {
	formatCompactDateRange,
	formatFriendlyDate,
	formatFriendlyDateTime,
	formatFriendlyTime,
	formatISODate
} from '@/utils/date-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list'
import Color from 'color'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import React from 'react'
import {
	startTransition,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef
} from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

import i18n from '@/localization/i18n'
import { calendar } from '@/utils/calendar-utils'
import { useTranslation } from 'react-i18next'
import { HeaderRight } from './HeaderButtons'

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
		const { styles } = useStyles(stylesheet)

		const title = section.title
		const isToday = formatISODate(title) === formatISODate(today)
		const formattedDate = formatFriendlyDate(title, { weekday: 'long' })
		const dateParts = formattedDate.split(', ')

		return (
			<View style={styles.sectionHeaderContainer}>
				<View style={styles.sectionView}>
					<View style={styles.sectionHeaderContent}>
						<View style={styles.dayContainer}>
							<Text style={styles.weekdayText(isToday)}>{dateParts[0]}</Text>
							{dateParts.length > 1 && (
								<Text style={styles.dateText(isToday)}>{dateParts[1]}</Text>
							)}
						</View>
						{isToday && <View style={styles.dateIndicator(isToday)} />}
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
	const listRef = useRef<FlashList<FlatListItem>>(null)
	const { t } = useTranslation('timetable')
	const { styles, theme } = useStyles(stylesheet)
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
			<View style={styles.pendingContainer}>
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
	}: { item: CalendarEntry }): React.JSX.Element {
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
					style={styles.cardPressable}
					android_ripple={{
						color: Color(theme.colors.calendarItem).alpha(0.1).string()
					}}
				>
					<View style={styles.eventCard}>
						<ColorBand color={theme.colors.calendarItem} />
						<View style={styles.eventContent}>
							<View style={styles.eventHeader}>
								<Text style={styles.eventTitle} numberOfLines={1}>
									{eventName}
								</Text>
							</View>
							<View style={styles.eventInfoRow}>
								<View style={styles.infoContainer}>
									{infoText && <Text style={styles.eventInfo}>{infoText}</Text>}
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
					style={styles.cardPressable}
					android_ripple={{
						color: Color(theme.colors.primary).alpha(0.1).string()
					}}
				>
					<View style={styles.eventCard}>
						<ColorBand color={theme.colors.primary} />
						<View style={styles.eventContent}>
							<View style={styles.eventHeader}>
								<Text style={styles.eventTitle} numberOfLines={1}>
									{item.name}
								</Text>
							</View>
							<View style={styles.eventInfoRow}>
								<View style={styles.eventLocation}>
									<Text style={styles.locationText}>
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
					style={styles.cardPressable}
					android_ripple={{
						color: Color(theme.colors.notification).alpha(0.1).string()
					}}
				>
					<View style={styles.eventCard}>
						<ColorBand color={theme.colors.notification} />
						<View style={styles.eventContent}>
							<View style={styles.eventHeader}>
								<Text style={styles.eventTitle} numberOfLines={2}>
									{exam.name}
								</Text>
							</View>
							<View style={styles.eventInfoRow}>
								<View style={styles.locationContainer}>
									{(exam.seat ?? exam.rooms) != null && (
										<Text style={styles.locationText}>
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
				<FlashList
					key={`flashlist-${UnistylesRuntime.themeName}`}
					ref={listRef}
					data={flatData}
					renderItem={renderItem}
					contentContainerStyle={styles.container}
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

const stylesheet = createStyleSheet((theme) => ({
	container: {
		paddingBottom: 80,
		paddingHorizontal: theme.margins.page
	},
	// Section header styling
	sectionHeaderContainer: {
		paddingVertical: 4,
		backgroundColor: theme.colors.background,
		zIndex: 10
	},
	sectionView: {
		paddingVertical: 6,
		paddingTop: theme.margins.page - 8,
		marginBottom: 4
	},
	sectionHeaderContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	dayContainer: {
		flexDirection: 'column'
	},
	weekdayText: (isToday: boolean) => ({
		fontSize: 19,
		fontWeight: '700',
		color: isToday ? theme.colors.primary : theme.colors.text,
		marginBottom: 2
	}),
	dateText: (isToday: boolean) => ({
		fontSize: 14,
		color: isToday ? theme.colors.primary : theme.colors.labelColor,
		fontWeight: isToday ? '600' : '400'
	}),
	dateIndicator: (isToday: boolean) => ({
		width: isToday ? 8 : 0,
		height: isToday ? 8 : 0,
		borderRadius: 4,
		backgroundColor: theme.colors.primary,
		marginRight: isToday ? 4 : 0
	}),

	// Event card styling
	cardPressable: {
		marginBottom: 10,
		borderRadius: theme.radius.md,
		overflow: 'hidden'
	},
	eventCard: {
		flexDirection: 'row',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		minHeight: 70,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	eventContent: {
		flex: 1,
		padding: 14,
		position: 'relative'
	},
	eventHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8
	},
	eventTitle: {
		fontSize: 15.5,
		fontWeight: '600',
		color: theme.colors.text,
		flex: 1,
		marginRight: 8
	},
	eventInfo: {
		fontSize: 14,
		color: theme.colors.labelColor
	},
	eventLocation: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	locationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	locationText: {
		fontSize: 14,
		color: theme.colors.labelColor
	},
	eventInfoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4
	},

	// Other styling
	pendingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	pendingText: {
		color: theme.colors.text,
		fontSize: 15
	},
	infoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	}
}))
