import ErrorView from '@/components/Error/ErrorView'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/DragView'
import Divider from '@/components/Universal/Divider'
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
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import type React from 'react'
import { startTransition, useCallback, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, SectionList, Text, View } from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

import i18n from '@/localization/i18n'
import { calendar } from '@/utils/calendar-utils'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { HeaderLeft, HeaderRight } from './HeaderButtons'

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
	const listRef = useRef<SectionList<TimetableEntry | ExamEntry>>(null)
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

		return (
			<Pressable
				onPress={() => router.navigate('/calendar')}
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
						<Text style={styles.titleText} numberOfLines={1}>
							{eventName}
						</Text>
						<Text style={styles.calendarInfoText}>{infoText}</Text>
					</View>
					{item.isAllDay ? (
						<View style={styles.allDayContainer}>
							<Text style={styles.allDayText}>
								{t('dates.allDay', { ns: 'common' })}
							</Text>
						</View>
					) : (
						<View>
							<Text style={styles.time}>
								{formatFriendlyTime(item.startDate)}
							</Text>
							{item.endDate && (
								<Text style={styles.time2}>
									{formatFriendlyTime(item.endDate)}
								</Text>
							)}
						</View>
					)}
				</View>
			</Pressable>
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
					keyExtractor={(item, index) => {
						return `${item.name}${index}${item.date.toString()}`
					}}
					viewabilityConfig={{
						itemVisiblePercentThreshold: 10
					}}
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
	},
	allDayContainer: {
		justifyContent: 'center'
	},
	allDayText: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	calendarInfoText: {
		color: theme.colors.labelColor,
		fontSize: 14
	}
}))
