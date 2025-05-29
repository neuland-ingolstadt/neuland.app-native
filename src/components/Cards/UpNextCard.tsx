import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import type React from 'react'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	AppState,
	type AppStateStatus,
	Pressable,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import Divider from '@/components/Universal/Divider'
import { USER_GUEST } from '@/data/constants'
import { useInterval } from '@/hooks/useInterval'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime, formatNearDate } from '@/utils/date-utils'
import { getOngoingOrNextEvent } from '@/utils/map-screen-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { UserKindContext } from '../contexts'
import BaseCard from './BaseCard'

const UpNextCard: React.FC = () => {
	const { styles, theme } = useStyles(stylesheet)
	const { userKind = USER_GUEST } = use(UserKindContext)
	const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
	const [currentEvent, setCurrentEvent] =
		useState<FriendlyTimetableEntry | null>(null)
	const [nextEvent, setNextEvent] = useState<FriendlyTimetableEntry | null>(
		null
	)
	const [todayStats, setTodayStats] = useState({
		total: 0,
		completed: 0,
		ongoing: 0,
		remaining: 0
	})
	const [currentTime, setCurrentTime] = useState(() => new Date())
	const { t } = useTranslation('navigation')
	const [appState, setAppState] = useState<AppStateStatus>(
		AppState.currentState
	)
	const [screenIsFocused, setScreenIsFocused] = useState(false) // Default to false, only true when focused
	const routeFocusRef = useRef(false)

	const isMountedRef = useRef(true)

	// Define refresh intervals with correct values
	const ACTIVE_REFRESH_INTERVAL = 60 * 1000 // 60 seconds when app is visible and focused
	const BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes when app is in background or on another page

	// Get current refresh interval based on app state and screen focus
	const refreshInterval = useMemo(() => {
		const isActive = appState === 'active' && screenIsFocused
		return isActive ? ACTIVE_REFRESH_INTERVAL : BACKGROUND_REFRESH_INTERVAL
	}, [appState, screenIsFocused])

	const loadTimetable = useCallback(async (): Promise<
		FriendlyTimetableEntry[]
	> => {
		const timetable = await getFriendlyTimetable(new Date(), true)
		if (timetable.length === 0) {
			throw new Error('Timetable is empty')
		}
		return timetable
	}, [])

	const { data: timetable } = useQuery({
		queryKey: ['timetableV2', userKind],
		queryFn: loadTimetable,
		staleTime: 10 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
		retry(failureCount, error) {
			const ignoreErrors = [
				'"Time table does not exist" (-202)',
				'Timetable is empty'
			]
			return !ignoreErrors.includes(error?.message) && failureCount < 2
		}
	})

	const updateData = useCallback(() => {
		if (timetable == null) return

		const now = new Date()
		const today = new Date(now)
		today.setHours(0, 0, 0, 0)

		const todayEvents = timetable.filter((item) => {
			const itemDate = new Date(item.startDate)
			itemDate.setHours(0, 0, 0, 0)
			return itemDate.getTime() === today.getTime()
		})

		const completedEvents = todayEvents.filter(
			(item) => new Date(item.endDate) < now
		)
		const ongoingEvents = todayEvents.filter(
			(item) => new Date(item.startDate) <= now && new Date(item.endDate) > now
		)
		const upcomingEvents = todayEvents.filter(
			(item) => new Date(item.startDate) > now
		)

		setTodayStats({
			total: todayEvents.length,
			completed: completedEvents.length,
			ongoing: ongoingEvents.length,
			remaining: upcomingEvents.length
		})

		const upNext = getOngoingOrNextEvent(timetable)
		if (upNext.length > 0) {
			setCurrentEvent(upNext[0])

			if (new Date(upNext[0].startDate) <= now) {
				const futureTodayEvents = todayEvents.filter(
					(entry) => new Date(entry.startDate) > now
				)
				futureTodayEvents.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
				)
				setNextEvent(futureTodayEvents.length > 0 ? futureTodayEvents[0] : null)
			} else {
				const startTimeOfCurrent = new Date(upNext[0].startDate).getTime()
				const futureTodayEvents = todayEvents.filter(
					(entry) => new Date(entry.startDate).getTime() > startTimeOfCurrent
				)
				futureTodayEvents.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
				)
				setNextEvent(futureTodayEvents.length > 0 ? futureTodayEvents[0] : null)
			}
		} else {
			setCurrentEvent(null)
			setNextEvent(null)
		}

		setLoadingState(LoadingState.LOADED)
	}, [timetable])

	const refreshAll = useCallback(() => {
		if (isMountedRef.current) {
			const now = new Date()
			setCurrentTime(now)
			updateData()
		}
	}, [updateData])

	useEffect(() => {
		isMountedRef.current = true

		// Set up AppState listener
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (isMountedRef.current) {
				setAppState(nextAppState)

				// Force an immediate refresh when coming back to foreground
				if (nextAppState === 'active' && routeFocusRef.current) {
					const now = new Date()
					setCurrentTime(now)
					if (timetable != null) {
						updateData()
					}
				}
			}
		})

		return () => {
			isMountedRef.current = false
			subscription.remove()
		}
	}, [timetable, updateData])

	// Track screen focus with Expo Router
	useFocusEffect(
		useCallback(() => {
			setScreenIsFocused(true)
			routeFocusRef.current = true

			// Ensure we refresh when focused
			if (userKind !== USER_GUEST) {
				// Only refresh if we have data to work with
				if (timetable != null) {
					const now = new Date()
					setCurrentTime(now)
					updateData()
				}
			} else if (userKind === USER_GUEST) {
				setLoadingState(LoadingState.ERROR)
			}

			return () => {
				setScreenIsFocused(false)
			}
		}, [userKind, timetable, updateData])
	)

	// Only run the interval when app is active and screen is focused
	useInterval(
		refreshAll,
		appState === 'active' && screenIsFocused ? refreshInterval : null
	)

	useEffect(() => {
		// Only refresh when timetable data first becomes available
		if (timetable != null) {
			refreshAll()
		}
	}, [timetable])

	const eventStatus = useMemo(() => {
		if (!currentEvent) return null

		const now = currentTime
		const startDate = new Date(currentEvent.startDate)
		const endDate = new Date(currentEvent.endDate)

		const isOngoing = startDate <= now && endDate > now
		const isSoon =
			startDate > now && startDate <= new Date(now.getTime() + 30 * 60 * 1000)
		const isEndingSoon =
			isOngoing && endDate.getTime() - now.getTime() <= 30 * 60 * 1000

		const timeRemaining = Math.ceil(
			isOngoing
				? (endDate.getTime() - now.getTime()) / 60000
				: (startDate.getTime() - now.getTime()) / 60000
		)

		const progress = isOngoing
			? 1 -
				(endDate.getTime() - now.getTime()) /
					(endDate.getTime() - startDate.getTime())
			: 0

		return {
			isOngoing,
			isSoon,
			isEndingSoon,
			timeRemaining,
			progress: Math.min(Math.max(0, progress), 1)
		}
	}, [currentEvent, currentTime])

	const ProgressBar = useMemo(() => {
		if (!eventStatus?.isOngoing) return null

		return (
			<View style={styles.progressBarContainer}>
				<View
					style={[
						styles.progressBar,
						{
							width: `${eventStatus.progress * 100}%`
						}
					]}
				/>
			</View>
		)
	}, [
		eventStatus,
		styles.progressBar,
		styles.progressBarContainer,
		theme.colors.primary
	])

	const EventStatus = useMemo(() => {
		if (!currentEvent || !eventStatus) return null

		let statusText = ''

		if (eventStatus.isOngoing) {
			if (eventStatus.isEndingSoon) {
				statusText = t('cards.timetable.endingSoon', {
					count: eventStatus.timeRemaining
				})
			} else {
				statusText = t('cards.timetable.ongoing', {
					time: formatFriendlyTime(currentEvent.endDate)
				})
			}
		} else if (eventStatus.isSoon) {
			statusText = t('cards.timetable.startingSoon', {
				count: eventStatus.timeRemaining
			})
		} else {
			statusText = formatNearDate(currentEvent.startDate) ?? ''
		}

		return <Text style={styles.eventDate}>{statusText}</Text>
	}, [currentEvent, eventStatus, t, theme.colors.secondary])

	const RoomInfo = useMemo(() => {
		if (!currentEvent) return null

		return (
			<View style={styles.roomContainer}>
				<Text style={styles.roomText}>{currentEvent.rooms.join(', ')}</Text>
			</View>
		)
	}, [currentEvent, styles.roomContainer, styles.roomText])

	const NextEvent = useMemo(() => {
		// Don't show next event if current event hasn't started yet
		if (
			!nextEvent ||
			(currentEvent && new Date(currentEvent.startDate) > currentTime)
		) {
			return null
		}

		const now = currentTime
		const today = new Date(now)
		today.setHours(0, 0, 0, 0)

		const nextEventDay = new Date(nextEvent.startDate)
		nextEventDay.setHours(0, 0, 0, 0)

		if (nextEventDay.getTime() !== today.getTime()) {
			return null
		}

		return (
			<View style={styles.nextEventContainer}>
				<Text style={styles.nextEventTime}>
					{formatFriendlyTime(nextEvent.startDate)}
				</Text>
				<Text style={styles.nextEventName} numberOfLines={1}>
					{'· '}
					{nextEvent.name}{' '}
					{nextEvent.rooms.length > 0 && (
						<Text style={styles.nextEventRoom}>
							· {nextEvent.rooms.join(', ')}
						</Text>
					)}
				</Text>
			</View>
		)
	}, [nextEvent, currentEvent, currentTime, formatFriendlyTime])

	const navigateDots = () => {
		router.navigate('/dots')
	}

	const Stats = useMemo(() => {
		if (todayStats.total === 0) return null

		let statsText = ''
		if (todayStats.remaining > 0) {
			if (todayStats.remaining === 1) {
				statsText = t('cards.timetable.lecturesRemaining_one', {
					count: todayStats.remaining
				})
			} else {
				statsText = t('cards.timetable.lecturesRemaining_plural', {
					count: todayStats.remaining
				})
			}
		} else {
			statsText = t('cards.timetable.noMoreLectures')
		}

		return (
			<View style={styles.statsContainer}>
				{NextEvent}
				<Pressable style={styles.statsRow} onPress={navigateDots}>
					<View style={styles.progressDots}>
						{Array.from({ length: todayStats.total }).map((_, index) =>
							index < todayStats.completed ? (
								<View key={index} style={[styles.dot, styles.dotCompleted]} />
							) : index < todayStats.completed + todayStats.ongoing ? (
								<View key={index} style={[styles.dot, styles.dotOngoing]} />
							) : (
								<View key={index} style={[styles.dot, styles.dotRemaining]} />
							)
						)}
					</View>
					<Text style={styles.statsText} numberOfLines={1}>
						{statsText}
					</Text>
				</Pressable>
			</View>
		)
	}, [NextEvent, t, todayStats])

	const NoEvents = useMemo(
		() => (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyTitle}>{t('cards.timetable.noEvents')}</Text>
				<Text style={styles.emptySubtitle}>
					{t('cards.timetable.enjoyDay')}
				</Text>
			</View>
		),
		[t]
	)

	return (
		<BaseCard title="timetable" onPressRoute="/timetable">
			{loadingState === LoadingState.LOADED &&
				(currentEvent ? (
					<View style={styles.mainContainer}>
						<View style={styles.eventHeader}>
							<Text style={styles.timeInfo}>
								{formatFriendlyTime(currentEvent.startDate)} -{' '}
								{formatFriendlyTime(currentEvent.endDate)}
							</Text>
							{EventStatus}
						</View>

						{ProgressBar}

						<View style={styles.eventContent}>
							<Text style={styles.eventTitle} numberOfLines={2}>
								{currentEvent.name}
							</Text>
							{RoomInfo}
						</View>

						{todayStats.total > 0 && (
							<Divider width="100%" color={theme.colors.border} />
						)}

						{Stats}
					</View>
				) : (
					NoEvents
				))}
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	mainContainer: {
		gap: 8,
		paddingTop: 8
	},
	eventHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	timeInfo: {
		color: theme.colors.text,
		fontSize: 14,
		fontVariant: ['tabular-nums']
	},
	statusText: {
		fontSize: 14,
		color: theme.colors.labelColor,
		fontWeight: '500'
	},
	eventContent: {
		gap: 4
	},
	eventTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		lineHeight: 20
	},
	roomContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 2
	},
	roomText: {
		color: theme.colors.labelColor,
		fontSize: 15
	},
	statsContainer: {
		marginTop: 4,
		flexDirection: 'column',
		gap: 8
	},
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	statsText: {
		color: theme.colors.labelColor,
		fontSize: 13
	},
	progressDots: {
		flexDirection: 'row',
		gap: 6,
		alignItems: 'center',
		flexWrap: 'wrap'
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4
	},
	dotCompleted: {
		backgroundColor: theme.colors.success
	},
	dotOngoing: {
		backgroundColor: theme.colors.success,
		opacity: 0.5
	},
	dotRemaining: {
		backgroundColor: theme.colors.soonDot,
		borderColor: theme.colors.labelColor,
		borderWidth: StyleSheet.hairlineWidth
	},
	progressBarContainer: {
		height: 4,
		backgroundColor: theme.colors.border,
		borderRadius: 2,
		overflow: 'hidden'
	},
	progressBar: {
		height: '100%',
		borderRadius: 2,
		backgroundColor: theme.colors.primary
	},
	emptyContainer: {
		paddingTop: 8
	},
	emptyTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500'
	},
	emptySubtitle: {
		color: theme.colors.labelColor,
		fontSize: 14,
		marginTop: 4
	},
	nextEventContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		marginTop: 2
	},
	nextEventPrefix: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14
	},
	nextEventTime: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '600',
		fontVariant: ['tabular-nums']
	},
	nextEventName: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		marginLeft: 4,
		flex: 1
	},
	nextEventRoom: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		fontWeight: '400'
	},
	eventDate: {
		color: theme.colors.secondary,
		fontSize: 14,
		fontWeight: '500'
	}
}))

export default UpNextCard
