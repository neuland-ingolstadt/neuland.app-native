import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { TimetableMode, useTimetableStore } from '@/hooks/useTimetableStore'
import type { ITimetableViewProps } from '@/types/timetable'
import type { Exam, FriendlyTimetableEntry } from '@/types/utils'
import { calendar } from '@/utils/calendar-utils'
import {
	CalendarBody,
	CalendarContainer,
	CalendarHeader,
	type CalendarKitHandle,
	type LocaleConfigsProps,
	type OnEventResponse,
	type PackedEvent
} from '@howljs/calendar-kit'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import moment from 'moment-timezone'
import React, {
	startTransition,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useDeferredValue
} from 'react'
import { View } from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

import { useTranslation } from 'react-i18next'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { HeaderLeft, HeaderRight } from './HeaderButtons'
import EventComponent from './WeekEventComponent'
import WeekHeaderEvent from './WeekHeaderEvent'

const timetableNumberDaysMap = {
	[TimetableMode.List]: 1,
	[TimetableMode.Timeline1]: 1,
	[TimetableMode.Timeline3]: 3,
	[TimetableMode.Timeline5]: 5,
	[TimetableMode.Timeline7]: 7
}

interface CalendarEvent {
	title: string
	name: string
	eventType: string
	id: string
	allDay: boolean
	start: {
		dateTime: Date
	}
	end: {
		dateTime: Date
	}
}

export default function TimetableWeek({
	timetable,
	exams
}: ITimetableViewProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { i18n, t } = useTranslation()
	const today = moment().startOf('day').toDate()
	const calendarRef = useRef<CalendarKitHandle>(null)
	const setSelectedLecture = useRouteParamsStore(
		(state) => state.setSelectedLecture
	)
	const setSelectedExam = useRouteParamsStore((state) => state.setSelectedExam)
	const [events, setEvents] = React.useState<PackedEvent[]>([])
	const [calendarLoaded, setCalendarLoaded] = React.useState(false)
	const [currentDate, setCurrentDate] = React.useState(today)
	const isDark = UnistylesRuntime.themeName === 'dark'
	const router = useRouter()
	const navigation = useNavigation()
	const timetableMode = useTimetableStore((state) => state.timetableMode)
	const showCalendarEvents = useTimetableStore(
		(state) => state.showCalendarEvents
	)
	const showExams = useTimetableStore((state) => state.showExams)
	const hasPendingUpdate = useTimetableStore(
		(state) => state.hasPendingTimetableUpdate
	)
	const setHasPendingUpdate = useTimetableStore(
		(state) => state.setHasPendingTimetableUpdate
	)

	// Defer the updates of timetableMode when there's a pending update
	const deferredTimetableMode = useDeferredValue(timetableMode)

	// Apply pending updates when returning to the screen
	useFocusEffect(
		useCallback(() => {
			if (hasPendingUpdate) {
				startTransition(() => {
					setHasPendingUpdate(false)
				})
			}
		}, [hasPendingUpdate])
	)

	// Use the deferred value only for timetable mode when there's no pending update
	const effectiveTimetableMode = hasPendingUpdate
		? timetableMode
		: deferredTimetableMode

	const calendarTheme = {
		colors: {
			primary: theme.colors.notification,
			onPrimary: theme.colors.contrast,
			background: theme.colors.background,
			onBackground: theme.colors.text,
			border: theme.colors.border,
			text: theme.colors.text,
			surface: theme.colors.labelBackground
		}
	}

	const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
		en: {
			weekDayShort: t('timetable:calendar.weekDayShort', {
				returnObjects: true,
				lng: 'en'
			}) as string[],
			meridiem: { ante: 'am', post: 'pm' },
			more: t('timetable:calendar.more', { lng: 'en' })
		},
		de: {
			weekDayShort: t('timetable:calendar.weekDayShort', {
				returnObjects: true,
				lng: 'de'
			}) as string[],
			meridiem: { ante: '', post: '' },
			more: t('timetable:calendar.more', { lng: 'de' })
		}
	}

	function showEventDetails(entry: OnEventResponse): void {
		if (entry.eventType === 'lecture') {
			setSelectedLecture(entry as unknown as FriendlyTimetableEntry)
			router.navigate('/lecture')
		} else if (entry.eventType === 'exam') {
			setSelectedExam(entry as unknown as Exam)
			router.navigate('/exam')
		} else if (entry.eventType === 'calendar') {
			router.navigate('/calendar')
		}
	}

	const combinedEvents = React.useMemo(() => {
		if (timetable.length === 0) return []
		// Process timetable lectures
		const friendlyTimetable = timetable.map(
			(entry: FriendlyTimetableEntry, index: number) => ({
				...entry,
				eventType: 'lecture',
				id: `lecture_${index}`,
				start: { dateTime: entry.startDate },
				end: { dateTime: entry.endDate }
			})
		)

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let friendlyExams: any[] = []
		if (showExams && exams.length > 0) {
			friendlyExams = exams.map((entry, index) => {
				const duration = Number(entry?.type?.match(/\d+/)?.[0] ?? 90)
				return {
					...entry,
					eventType: 'exam',
					id: `exam_${index}`,
					start: { dateTime: entry.date },
					end: {
						dateTime: moment(entry.date).add(duration, 'minutes').toDate()
					}
				}
			})
		}

		// Process calendar events if enabled
		let calendarEvents: CalendarEvent[] = []
		if (showCalendarEvents && calendar?.length > 0) {
			calendarEvents = calendar
				.filter((event) => event.begin) // Filter out events without a date
				.map((event, index) => {
					let startDate: Date
					let endDate: Date
					const isAllDay = !event.hasHours
					if (isAllDay) {
						startDate = moment(event.begin).toDate()
						endDate = event.end
							? moment(event.end).toDate()
							: moment(startDate).toDate()
					} else {
						startDate = moment(event.begin).toDate()
						endDate = event.end
							? moment(event.end).toDate()
							: moment(startDate).add(2, 'hours').toDate()
					}
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
						id: `calendar_${index}`,
						allDay: isAllDay,
						start: { dateTime: startDate },
						end: { dateTime: endDate }
					}
				})
		}

		return [
			...friendlyTimetable,
			...friendlyExams,
			...calendarEvents
		] as unknown as PackedEvent[]
	}, [timetable, exams, showCalendarEvents, showExams, i18n.language])

	useEffect(() => {
		startTransition(() => {
			setEvents(combinedEvents)
			const firstFutureEvent = combinedEvents
				.sort((a, b) => moment(a.start.dateTime).diff(moment(b.start.dateTime)))
				.find(
					(event) =>
						moment(event.start.dateTime).startOf('day').toDate() >= today
				)
			if (firstFutureEvent?.start?.dateTime) {
				setCurrentDate(new Date(firstFutureEvent.start.dateTime))
			}
		})
	}, [combinedEvents])

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderRight
					setToday={() => {
						const calDate = calendarRef.current?.getVisibleStart()
						if (calDate != null) {
							const momentCalDate = moment(calDate).startOf('day')
							const momentToday = moment().startOf('day')
							const targetDate = momentCalDate.isSame(momentToday)
								? (currentDate ?? new Date())
								: new Date()
							calendarRef.current?.goToDate({ date: targetDate })
						}
					}}
				/>
			),
			headerLeft: () => (
				<HeaderLeft
					onPressPreferences={() => router.navigate('/timetable-preferences')}
					onPressPrevious={onPressPrevious}
					onPressNext={onPressNext}
				/>
			)
		})
	}, [navigation])

	const renderEvent = useCallback(
		(event: PackedEvent) => {
			return <EventComponent event={event} theme={theme} isDark={isDark} />
		},
		[theme.colors.primary, events]
	)

	const renderHeaderEvent = useCallback(
		(event: PackedEvent) => {
			return <WeekHeaderEvent event={event} theme={theme} />
		},
		[theme.colors.primary, events]
	)

	const onPressPrevious = (): void => {
		calendarRef.current?.goToPrevPage()
	}

	const onPressNext = (): void => {
		calendarRef.current?.goToNextPage()
	}

	const [timetableNumberDays, setTimetableNumberDays] = React.useState(
		timetableNumberDaysMap[effectiveTimetableMode] ?? 3
	)
	useEffect(() => {
		if (calendarLoaded) {
			React.startTransition(() => {
				setTimetableNumberDays(timetableNumberDaysMap[effectiveTimetableMode])
			})
		}
	}, [effectiveTimetableMode])

	if (hasPendingUpdate) {
		return (
			<View style={styles.pendingContainer}>
				<LoadingIndicator />
			</View>
		)
	}

	return (
		<View style={styles.page}>
			{!calendarLoaded && (
				<View style={styles.loadingContainer}>
					<LoadingIndicator />
				</View>
			)}
			<CalendarContainer
				onLoad={() => {
					setCalendarLoaded(true)
				}}
				useAllDayEvent
				allowPinchToZoom={true}
				start={420}
				end={1320}
				ref={calendarRef}
				numberOfDays={timetableNumberDays}
				scrollByDay={
					effectiveTimetableMode !== TimetableMode.Timeline5 &&
					effectiveTimetableMode !== TimetableMode.Timeline7
				}
				hideWeekDays={
					effectiveTimetableMode === TimetableMode.Timeline5 ? [6, 7] : []
				}
				events={events}
				theme={calendarTheme}
				initialLocales={initialLocales}
				locale={i18n.language}
				onPressEvent={(event) => {
					showEventDetails(event)
				}}
				onDateChanged={(date) => {
					setCurrentDate(new Date(date))
				}}
				initialDate={currentDate}
				onPressDayNumber={(date) => {
					calendarRef.current?.goToDate({ date })
				}}
				showWeekNumber
				rightEdgeSpacing={3}
				overlapEventsSpacing={1}
				minTimeIntervalHeight={55}
				scrollToNow={false}
			>
				<CalendarHeader renderEvent={renderHeaderEvent} />
				<CalendarBody renderEvent={renderEvent} hourFormat="HH:mm" />
			</CalendarContainer>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	buttons: {
		flexDirection: 'row',
		gap: 4
	},
	loadingContainer: {
		alignItems: 'center',
		flex: 1,
		height: '100%',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%',
		zIndex: 1
	},
	page: {
		flex: 1
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
