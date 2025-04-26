import ErrorView from '@/components/Error/ErrorView'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/DragView'
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
import Color from 'color'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import type React from 'react'
import { startTransition, useCallback, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, SectionList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import i18n from '@/localization/i18n'
import { calendar } from '@/utils/calendar-utils'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { HeaderLeft, HeaderRight } from './HeaderButtons'

type TimetableSection = {
	title: Date
	data: (TimetableEntry | ExamEntry | CalendarEntry)[]
}

type TimetableItem = TimetableEntry | ExamEntry | CalendarEntry

// Regular SectionList, removed animation
const TimetableSectionList = SectionList

export type CalendarEntry = {
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

export default function TimetableList({
	timetable,
	exams
}: ITimetableViewProps): React.JSX.Element {
	/**
	 * Constants
	 */
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	/**
	 * Hooks
	 */
	const router = useRouter()
	const navigation = useNavigation()
	const listRef = useRef<SectionList<TimetableItem, TimetableSection>>(null)
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

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderRight
					setToday={() => {
						listRef.current?.scrollToLocation({
							sectionIndex: 0,
							itemIndex: 0,
							viewOffset: 0,
							viewPosition: 0
						})
					}}
				/>
			),
			headerLeft: () => (
				<HeaderLeft
					onPressPreferences={() => router.navigate('/timetable-preferences')}
				/>
			)
		})
	}, [navigation])

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

	const examsList = showExams ? exams : []
	const groupedTimetable = getGroupedTimetable(
		timetable,
		examsList,
		showCalendarEvents,
		calendar
	)
	const filteredTimetable = groupedTimetable.filter(
		(section) => section.title >= today
	)

	/**
	 * Functions
	 */
	function showEventDetails(entry: FriendlyTimetableEntry): void {
		setSelectedLecture(entry)
		router.navigate('/lecture')
	}

	function renderSectionHeader({
		section
	}: {
		section: TimetableSection
	}): React.JSX.Element {
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
						<View style={styles.dateIndicator(isToday)} />
					</View>
				</View>
			</View>
		)
	}

	function renderSectionFooter(): React.JSX.Element {
		return <View style={styles.sectionFooter} />
	}

	function renderItemSeparator(): React.JSX.Element {
		return <View style={styles.itemSeparator} />
	}

	function renderCalendarItem({
		item
	}: { item: CalendarEntry }): React.JSX.Element {
		// Get proper name value as a string
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
				? `${t('calendar.thiCalendar')}: ${formatCompactDateRange(item.originalStartDate || item.startDate, item.originalEndDate || null)}`
				: t('calendar.thiCalendar')

		// Time display text
		const timeDisplay = item.isAllDay ? (
			<View style={styles.eventBadge}>
				<Text style={styles.badgeText}>
					{t('dates.allDay', { ns: 'common' })}
				</Text>
			</View>
		) : (
			<View style={styles.timeContainer}>
				<Text style={styles.startTime}>
					{formatFriendlyTime(item.startDate)}
				</Text>
				{item.endDate && (
					<>
						<View style={styles.timeSeparator} />
						<Text style={styles.endTime}>
							{formatFriendlyTime(item.endDate)}
						</Text>
					</>
				)}
			</View>
		)

		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={`${eventName} (${infoText})`}
			>
				<Pressable
					onPress={() => router.navigate('/calendar')}
					style={styles.cardPressable}
					android_ripple={{
						color: Color(theme.colors.calendarItem).alpha(0.1).string()
					}}
				>
					<View style={styles.eventCard}>
						<View
							style={[
								styles.eventColorBand,
								{ backgroundColor: theme.colors.calendarItem }
							]}
						/>
						<View style={styles.eventContent}>
							<View style={styles.eventHeader}>
								<Text style={styles.eventTitle} numberOfLines={1}>
									{eventName}
								</Text>
							</View>
							<View style={styles.eventInfoRow}>
								<Text style={styles.eventInfo}>{infoText}</Text>
								{timeDisplay}
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
						<View
							style={[
								styles.eventColorBand,
								{ backgroundColor: theme.colors.primary }
							]}
						/>
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
								<View style={styles.timeContainer}>
									<Text style={styles.startTime}>
										{formatFriendlyTime(item.startDate)}
									</Text>
									<View style={styles.timeSeparator} />
									<Text style={styles.endTime}>
										{formatFriendlyTime(item.endDate)}
									</Text>
								</View>
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
						<View
							style={[
								styles.eventColorBand,
								{ backgroundColor: theme.colors.notification }
							]}
						/>
						<View style={styles.eventContent}>
							<View style={styles.eventHeader}>
								<Text style={styles.eventTitle} numberOfLines={2}>
									{t('cards.calendar.exam', {
										ns: 'navigation',
										name: exam.name
									})}
								</Text>
								<View style={styles.examBadge}>
									<Text style={styles.examBadgeText}>Exam</Text>
								</View>
							</View>
							<View style={styles.eventInfoRow}>
								<Text style={styles.locationText}>
									{exam.seat ?? exam.rooms}
								</Text>
								<View style={styles.timeContainer}>
									<Text style={styles.startTime}>
										{formatFriendlyTime(exam.date)}
									</Text>
									<View style={styles.timeSeparator} />
									<Text style={styles.endTime}>
										{formatFriendlyTime(exam.endDate)}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</Pressable>
			</DragDropView>
		)
	}

	function renderItem({
		item
	}: {
		item: ExamEntry | TimetableEntry | CalendarEntry
	}): React.JSX.Element {
		if (item.eventType === 'exam') {
			return renderExamItem({ exam: item })
		}
		if (item.eventType === 'calendar') {
			return renderCalendarItem({ item })
		}
		return renderTimetableItem({ item: item as FriendlyTimetableEntry })
	}

	return (
		<>
			{filteredTimetable.length === 0 ? (
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
				<TimetableSectionList
					ref={listRef}
					sections={filteredTimetable}
					renderItem={renderItem}
					renderSectionHeader={renderSectionHeader}
					renderSectionFooter={renderSectionFooter}
					ItemSeparatorComponent={renderItemSeparator}
					contentContainerStyle={styles.container}
					stickySectionHeadersEnabled={true}
					initialNumToRender={20}
					keyExtractor={(item: TimetableItem, index: number) => {
						return `${item.name}${index}${item.date.toString()}`
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
		paddingVertical: 8,
		backgroundColor: theme.colors.background,
		zIndex: 1
	},
	sectionView: {
		paddingVertical: 10,
		paddingTop: theme.margins.page,
		marginBottom: 10
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
		fontSize: 22,
		fontWeight: '700',
		color: isToday ? theme.colors.primary : theme.colors.text,
		marginBottom: 2
	}),
	dateText: (isToday: boolean) => ({
		fontSize: 15,
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
		marginBottom: 8,
		borderRadius: theme.radius.md,
		overflow: 'hidden'
	},
	eventCard: {
		flexDirection: 'row',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		shadowColor: theme.colors.text,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		minHeight: 80
	},
	eventColorBand: {
		width: 6,
		borderTopLeftRadius: theme.radius.md,
		borderBottomLeftRadius: theme.radius.md
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
		fontSize: 16,
		fontWeight: '600',
		color: theme.colors.text,
		flex: 1,
		marginRight: 8
	},
	eventInfo: {
		fontSize: 14,
		color: theme.colors.labelColor,
		marginTop: 2
	},
	eventLocation: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	locationText: {
		fontSize: 14,
		color: theme.colors.labelColor
	},
	eventInfoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	timeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Color(theme.colors.background).alpha(0.5).string(),
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 12,
		marginLeft: 8
	},
	startTime: {
		fontSize: 14,
		fontWeight: '500',
		color: theme.colors.text,
		fontVariant: ['tabular-nums']
	},
	timeSeparator: {
		width: 3,
		height: 3,
		borderRadius: 1.5,
		backgroundColor: theme.colors.labelColor,
		marginHorizontal: 4
	},
	endTime: {
		fontSize: 14,
		color: theme.colors.labelColor,
		fontVariant: ['tabular-nums']
	},

	// Badge styling
	eventBadge: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		backgroundColor: Color(theme.colors.calendarItem).alpha(0.15).string(),
		borderRadius: 12
	},
	badgeText: {
		fontSize: 12,
		color: theme.colors.calendarItem,
		fontWeight: '500'
	},
	examBadge: {
		position: 'absolute',
		top: 14,
		right: 14,
		paddingHorizontal: 8,
		paddingVertical: 3,
		backgroundColor: Color(theme.colors.notification).alpha(0.15).string(),
		borderRadius: 12
	},
	examBadgeText: {
		fontSize: 12,
		color: theme.colors.notification,
		fontWeight: '500'
	},

	// Other styling
	itemSeparator: {
		height: 8
	},
	sectionFooter: {
		height: 20
	},
	pendingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	pendingText: {
		color: theme.colors.text,
		fontSize: 16
	}
}))
