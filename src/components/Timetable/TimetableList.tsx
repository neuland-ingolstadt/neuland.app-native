import ErrorView from '@/components/Error/ErrorView'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/DragView'
import Divider from '@/components/Universal/Divider'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { ITimetableViewProps } from '@/types/timetable'
import type {
	ExamEntry,
	FriendlyTimetableEntry,
	TimetableEntry
} from '@/types/utils'
import { calendar } from '@/utils/calendar-utils'
import {
	formatFriendlyDate,
	formatFriendlyDateTime,
	formatFriendlyTime,
	formatISODate
} from '@/utils/date-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRouter } from 'expo-router'
import moment from 'moment-timezone'
import type React from 'react'
import { useLayoutEffect, useRef } from 'react'
import { useDeferredValue } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, SectionList, Text, View } from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import { HeaderRight } from './HeaderButtons'

export type FlashListItems = FriendlyTimetableEntry | Date | string

// Interface for calendar event handling
interface CalendarEventEntry {
	eventType: 'calendar'
	title: string
	name: string
	startDate: Date
	endDate: Date
	date: Date
	rooms: string[]
	allDay?: boolean
}

export default function TimetableList({
	timetable,
	exams
}: ITimetableViewProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const router = useRouter()
	const navigation = useNavigation()
	const listRef =
		useRef<SectionList<TimetableEntry | ExamEntry | CalendarEventEntry>>(null)
	const { t, i18n } = useTranslation('timetable')
	const showExams = usePreferencesStore((state) => state.showExams)
	const showCalendarEvents = usePreferencesStore(
		(state) => state.showCalendarEvents
	)
	const setSelectedLecture = useRouteParamsStore(
		(state) => state.setSelectedLecture
	)
	const setSelectedExam = useRouteParamsStore((state) => state.setSelectedExam)

	// Use deferred value for smoother UI
	const deferredShowExams = useDeferredValue(showExams)
	const deferredShowCalendarEvents = useDeferredValue(showCalendarEvents)

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
				<Pressable
					onPress={() => {
						router.navigate('/timetable-preferences')
					}}
				>
					<PlatformIcon
						web={{
							name: 'Settings',
							size: 24
						}}
						android={{
							name: 'settings',
							size: 24
						}}
						ios={{
							name: 'gear',
							size: 22
						}}
						style={{ color: theme.colors.text }}
					/>
				</Pressable>
			)
		})
	}, [navigation])

	const examsList = deferredShowExams ? exams : []

	// Process calendar events if enabled
	let calendarEvents: CalendarEventEntry[] = []
	if (deferredShowCalendarEvents && calendar?.length > 0) {
		calendarEvents = calendar
			.filter((event) => event.begin) // Filter out events without a date
			.flatMap((event) => {
				let startDate: Date
				let endDate: Date
				const isAllDay = !event.hasHours

				if (isAllDay) {
					startDate = moment(event.begin).startOf('day').toDate()
					endDate = event.end
						? moment(event.end).endOf('day').toDate()
						: moment(startDate).endOf('day').toDate()

					// For multi-day all-day events, create an entry for each day
					if (event.end && !moment(startDate).isSame(event.end, 'day')) {
						// Calculate number of days between start and end
						const start = moment(startDate)
						const end = moment(endDate)
						const daysDiff = end.diff(start, 'days') + 1 // +1 to include the end date

						// Create an array of entries, one for each day of the event
						return Array.from({ length: daysDiff }, (_, i) => {
							const currentDate = moment(startDate).add(i, 'days').toDate()
							const eventName =
								typeof event.name === 'object'
									? event.name[i18n.language as 'de' | 'en'] ||
										event.name.de ||
										event.name.en
									: event.name

							return {
								title: eventName,
								name: eventName,
								eventType: 'calendar',
								startDate: startDate,
								endDate: endDate,
								date: currentDate,
								rooms: [],
								allDay: true
							}
						})
					}
				}

				// Handle regular events or single-day all-day events
				startDate = isAllDay
					? moment(event.begin).startOf('day').toDate()
					: moment(event.begin).toDate()
				endDate = event.end
					? isAllDay
						? moment(event.end).endOf('day').toDate()
						: moment(event.end).toDate()
					: isAllDay
						? moment(startDate).endOf('day').toDate()
						: moment(startDate).add(2, 'hours').toDate()

				const eventName =
					typeof event.name === 'object'
						? event.name[i18n.language as 'de' | 'en'] ||
							event.name.de ||
							event.name.en
						: event.name

				return [
					{
						title: eventName,
						name: eventName,
						eventType: 'calendar',
						startDate: startDate,
						endDate: endDate,
						date: startDate,
						rooms: [],
						allDay: isAllDay
					}
				]
			})
	}

	const groupedTimetable = getGroupedTimetable(
		timetable,
		examsList,
		calendarEvents
	)
	const filteredTimetable = groupedTimetable.filter(
		(section) => section.title >= today
	)
	const isDark = UnistylesRuntime.themeName === 'dark'
	function getLineColor(color: string): string {
		return Color(color)
			.darken(isDark ? 0.2 : 0)
			.lighten(isDark ? 0 : 0.2)
			.hex()
	}

	/**
	 * Functions
	 */
	function showEventDetails(entry: FriendlyTimetableEntry): void {
		setSelectedLecture(entry)
		router.navigate('/lecture')
	}

	function navigateToCalendar(): void {
		router.navigate('/calendar')
	}

	function renderSectionHeader(title: Date): React.JSX.Element {
		const isToday = formatISODate(title) === formatISODate(today)

		return (
			<View style={styles.sectionView}>
				<Text style={styles.sectionTitle(isToday)}>
					{formatFriendlyDate(title, { weekday: 'long' })}
				</Text>
				<Divider iosPaddingLeft={16} width={'100%'} />
			</View>
		)
	}

	function renderSectionFooter(): React.JSX.Element {
		return <View style={styles.sectionFooter} />
	}

	function renderItemSeparator(): React.JSX.Element {
		return <Divider color={theme.colors.border} iosPaddingLeft={16} />
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
					style={styles.pressable}
				>
					<View style={styles.eventWrapper}>
						<LinearGradient
							colors={[
								theme.colors.primary,
								getLineColor(theme.colors.primary)
							]}
							start={[0, 0.9]}
							end={[0.7, 0.25]}
							style={{
								...styles.indicator
							}}
						/>
						<View style={styles.nameView}>
							<Text style={styles.titleText} numberOfLines={1}>
								{item.name}
							</Text>
							<View style={styles.itemRow}>
								<Text style={styles.descriptionText}>
									{item.rooms.join(', ')}
								</Text>
							</View>
						</View>
						<View>
							<Text style={styles.time}>
								{formatFriendlyTime(item.startDate)}
							</Text>
							<Text style={styles.time2}>
								{formatFriendlyTime(item.endDate)}
							</Text>
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
					style={styles.pressable}
				>
					<View style={styles.eventWrapper}>
						<LinearGradient
							colors={[
								theme.colors.notification,
								getLineColor(theme.colors.notification)
							]}
							start={[0, 0.9]}
							end={[0.7, 0.25]}
							style={styles.indicator}
						/>
						<View style={styles.nameView}>
							<Text style={styles.titleText} numberOfLines={2}>
								{t('cards.calendar.exam', {
									ns: 'navigation',
									name: exam.name
								})}
							</Text>
							<View style={styles.itemRow}>
								<Text style={styles.descriptionText}>
									{exam.seat ?? exam.rooms}
								</Text>
							</View>
						</View>
						<View>
							<Text style={styles.time}>{formatFriendlyTime(exam.date)}</Text>
							<Text style={styles.time2}>
								{formatFriendlyTime(exam.endDate)}
							</Text>
						</View>
					</View>
				</Pressable>
			</DragDropView>
		)
	}

	function renderCalendarItem({
		item
	}: { item: CalendarEventEntry }): React.JSX.Element {
		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={`${item.name} (${formatFriendlyDateTime(item.startDate)}${item.allDay ? ' All day' : ''})`}
			>
				<Pressable
					onPress={() => {
						navigateToCalendar()
					}}
					style={styles.pressable}
				>
					<View style={styles.eventWrapper}>
						<LinearGradient
							colors={[
								theme.colors.calendarItem,
								getLineColor(theme.colors.calendarItem)
							]}
							start={[0, 0.9]}
							end={[0.7, 0.25]}
							style={styles.indicator}
						/>
						<View style={styles.nameView}>
							<Text style={styles.titleText} numberOfLines={2}>
								{item.name}
							</Text>
							<View style={styles.itemRow}>
								<Text style={styles.descriptionText}>
									{/* Removed the all-day label from here */}
								</Text>
							</View>
						</View>
						<View>
							{!item.allDay && (
								<>
									<Text style={styles.time}>
										{formatFriendlyTime(item.startDate)}
									</Text>
									<Text style={styles.time2}>
										{formatFriendlyTime(item.endDate)}
									</Text>
								</>
							)}
							{item.allDay && (
								<Text style={styles.calendarAllDay}>{t('time.allDay')}</Text>
							)}
						</View>
					</View>
				</Pressable>
			</DragDropView>
		)
	}

	function renderItem({
		item
	}: {
		item: ExamEntry | TimetableEntry | CalendarEventEntry
	}): React.JSX.Element {
		if (item.eventType === 'exam') {
			return renderExamItem({ exam: item as ExamEntry })
		}
		if (item.eventType === 'calendar') {
			return renderCalendarItem({ item: item as CalendarEventEntry })
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
				<SectionList
					ref={listRef}
					sections={filteredTimetable}
					renderItem={renderItem}
					renderSectionHeader={({ section: { title } }) => {
						if (!(title instanceof Date)) {
							console.error('Invalid section title')
							return null
						}
						return renderSectionHeader(title)
					}}
					renderSectionFooter={renderSectionFooter}
					ItemSeparatorComponent={renderItemSeparator}
					contentContainerStyle={styles.container}
					stickySectionHeadersEnabled={true}
					initialNumToRender={20}
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
	descriptionText: {
		color: theme.colors.labelColor,
		fontSize: 15
	},
	eventWrapper: {
		display: 'flex',
		flexDirection: 'row',
		gap: 10
	},
	indicator: {
		backgroundColor: theme.colors.primary,
		borderRadius: 2,
		height: '100%',
		width: 4
	},

	itemRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4
	},
	nameView: {
		flexGrow: 1,
		flexShrink: 1,
		marginRight: 12
	},
	pressable: {
		paddingVertical: 8
	},
	sectionFooter: {
		height: 20
	},
	sectionTitle: (isToday: boolean) => ({
		fontSize: 15,
		fontWeight: 'bold',
		textTransform: 'uppercase',
		color: isToday ? theme.colors.primary : theme.colors.text
	}),
	sectionView: {
		backgroundColor: theme.colors.background,
		gap: 6,
		marginBottom: 8,
		paddingTop: theme.margins.page
	},
	time: {
		color: theme.colors.text,
		fontSize: 15,
		fontVariant: ['tabular-nums']
	},
	time2: {
		color: theme.colors.labelColor,
		fontSize: 15,
		fontVariant: ['tabular-nums']
	},
	calendarAllDay: {
		color: theme.colors.text,
		fontSize: 15
	},
	titleText: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500'
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
