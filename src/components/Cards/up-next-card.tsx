import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import type React from 'react'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	AppState,
	type AppStateStatus,
	Pressable,
	Text,
	View
} from 'react-native'
import { useCSSVariable, useResolveClassNames } from 'uniwind'
import Divider from '@/components/Universal/Divider'
import PulsingDot from '@/components/Universal/pulsing-dot'
import { USER_GUEST } from '@/data/constants'
import { useInterval } from '@/hooks/useInterval'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime, formatNearDate } from '@/utils/date-utils'
import { getOngoingOrNextEvent } from '@/utils/map-screen-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import { UserKindContext } from '../contexts'
import BaseCard from './base-card'

const UpNextCard = (): React.JSX.Element => {
	const borderColor = useCSSVariable('--color-border')
	const dotOngoingStyle = useResolveClassNames('w-2 h-2 rounded-xs bg-success')
	const { userKind = USER_GUEST } = use(UserKindContext)
	const [currentTime, setCurrentTime] = useState(() => new Date())
	const { t } = useTranslation(['navigation', 'timetable'])
	const [appState, setAppState] = useState<AppStateStatus>(
		AppState.currentState
	)
	const [screenIsFocused, setScreenIsFocused] = useState(false)
	const routeFocusRef = useRef(false)

	const isMountedRef = useRef(true)

	const ACTIVE_REFRESH_INTERVAL = 60 * 1000
	const BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1000

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

	const {
		data: timetable,
		error: timetableError,
		isLoading
	} = useQuery({
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

	const loadingState = useMemo(() => {
		if (userKind === USER_GUEST) {
			return LoadingState.ERROR
		}
		if (timetableError) {
			if (timetableError.message === '"Time table does not exist" (-202)') {
				return LoadingState.LOADED
			}
			return LoadingState.ERROR
		}
		if (timetable != null) {
			return LoadingState.LOADED
		}
		if (isLoading) {
			return LoadingState.LOADING
		}
		return LoadingState.LOADING
	}, [userKind, timetable, timetableError, isLoading])

	const { currentEvent, nextEvent, todayStats } = useMemo(() => {
		const emptyStats = { total: 0, completed: 0, ongoing: 0, remaining: 0 }
		if (timetable == null) {
			return {
				currentEvent: null as FriendlyTimetableEntry | null,
				nextEvent: null as FriendlyTimetableEntry | null,
				todayStats: emptyStats
			}
		}

		const now = currentTime
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

		const stats = {
			total: todayEvents.length,
			completed: completedEvents.length,
			ongoing: ongoingEvents.length,
			remaining: upcomingEvents.length
		}

		const upNext = getOngoingOrNextEvent(timetable)
		if (upNext.length === 0) {
			return {
				currentEvent: null,
				nextEvent: null,
				todayStats: stats
			}
		}

		const current = upNext[0]
		let next: FriendlyTimetableEntry | null = null

		if (new Date(current.startDate) <= now) {
			const futureTodayEvents = todayEvents
				.filter((entry) => new Date(entry.startDate) > now)
				.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
				)
			next = futureTodayEvents[0] ?? null
		} else {
			const startTimeOfCurrent = new Date(current.startDate).getTime()
			const futureTodayEvents = todayEvents
				.filter(
					(entry) => new Date(entry.startDate).getTime() > startTimeOfCurrent
				)
				.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
				)
			next = futureTodayEvents[0] ?? null
		}

		return {
			currentEvent: current,
			nextEvent: next,
			todayStats: stats
		}
	}, [timetable, currentTime])

	const refreshCurrentTime = useCallback(() => {
		if (isMountedRef.current) {
			setCurrentTime(new Date())
		}
	}, [])

	useEffect(() => {
		isMountedRef.current = true

		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (isMountedRef.current) {
				setAppState(nextAppState)

				if (nextAppState === 'active' && routeFocusRef.current) {
					refreshCurrentTime()
				}
			}
		})

		return () => {
			isMountedRef.current = false
			subscription.remove()
		}
	}, [refreshCurrentTime])

	useFocusEffect(
		useCallback(() => {
			setScreenIsFocused(true)
			routeFocusRef.current = true

			if (userKind !== USER_GUEST) {
				refreshCurrentTime()
			}

			return () => {
				setScreenIsFocused(false)
			}
		}, [userKind, refreshCurrentTime])
	)

	useInterval(
		refreshCurrentTime,
		appState === 'active' && screenIsFocused ? refreshInterval : null
	)

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
			<View className="h-1 bg-border rounded-sm overflow-hidden">
				<View
					className="h-full rounded-sm bg-primary"
					style={{
						width: `${eventStatus.progress * 100}%`
					}}
				/>
			</View>
		)
	}, [eventStatus])

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

		return (
			<Text className="text-secondary text-sm font-medium">{statusText}</Text>
		)
	}, [currentEvent, eventStatus, t])

	const RoomInfo = useMemo(() => {
		if (!currentEvent) return null

		return (
			<View className="flex-row items-center mt-0.5">
				<Text className="text-label text-[15px]">
					{currentEvent.rooms.join(', ')}
				</Text>
			</View>
		)
	}, [currentEvent])

	const NextEvent = useMemo(() => {
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
			<View className="flex-row items-center flex-wrap mt-0.5">
				<Text className="text-label text-sm font-semibold tabular-nums">
					{formatFriendlyTime(nextEvent.startDate)}
				</Text>
				<Text
					className="text-label-secondary text-sm ml-1 flex-1"
					numberOfLines={1}
				>
					{'· '}
					{nextEvent.name}{' '}
					{nextEvent.rooms.length > 0 && (
						<Text className="text-label-secondary text-sm font-normal">
							· {nextEvent.rooms.join(', ')}
						</Text>
					)}
				</Text>
			</View>
		)
	}, [nextEvent, currentEvent, currentTime])

	const navigateDots = () => {
		router.navigate('/dots')
	}

	const Stats = useMemo(() => {
		if (todayStats.total === 0) return null

		let statsText = ''
		if (todayStats.remaining > 0) {
			statsText = t('cards.timetable.lecturesRemaining', {
				count: todayStats.remaining
			})
		} else {
			statsText = t('cards.timetable.noMoreLectures')
		}

		return (
			<View className="mt-1 flex-col gap-2">
				{NextEvent}
				<Pressable
					className="flex-row items-center gap-2"
					onPress={navigateDots}
					hitSlop={10}
				>
					<View className="flex-row gap-1.5 items-center flex-wrap">
						{Array.from({ length: todayStats.total }).map((_, index) =>
							index < todayStats.completed ? (
								<View
									key={index}
									className="w-2 h-2 rounded-xs bg-completed-dot"
								/>
							) : index < todayStats.completed + todayStats.ongoing ? (
								<PulsingDot key={index} style={dotOngoingStyle} />
							) : (
								<View
									key={index}
									className="w-2 h-2 rounded-xs bg-soon-dot border border-label"
									style={hairlineBorder}
								/>
							)
						)}
					</View>
					<Text className="text-label text-[13px]" numberOfLines={1}>
						{statsText}
					</Text>
				</Pressable>
			</View>
		)
	}, [NextEvent, dotOngoingStyle, t, todayStats])

	const NoEvents = useMemo(
		() => (
			<View className="pt-2">
				<Text className="text-text text-base font-medium">
					{t('cards.timetable.noEvents')}
				</Text>
				<Text className="text-label text-sm">
					{t('cards.timetable.enjoyDay')}
				</Text>
			</View>
		),
		[t]
	)

	const NotYetSetUp = useMemo(
		() => (
			<View className="pt-2">
				<Text className="text-text text-base font-medium">
					{t('timetable:error.empty.subtitle')}
				</Text>
			</View>
		),
		[t]
	)

	const isNotYetSetUp =
		timetableError?.message === '"Time table does not exist" (-202)'

	return (
		<BaseCard title="timetable" onPressRoute="/timetable">
			{loadingState === LoadingState.LOADED &&
				(currentEvent ? (
					<View className="gap-2 pt-2">
						<View className="flex-row justify-between items-center">
							<Text className="text-text text-sm tabular-nums">
								{formatFriendlyTime(currentEvent.startDate)} -{' '}
								{formatFriendlyTime(currentEvent.endDate)}
							</Text>
							{EventStatus}
						</View>

						{ProgressBar}

						<View className="gap-1">
							<Text
								className="text-text text-base font-semibold leading-5"
								numberOfLines={2}
							>
								{currentEvent.name}
							</Text>
							{RoomInfo}
						</View>

						{todayStats.total > 0 && (
							<Divider width="100%" color={toColor(borderColor)} />
						)}

						{Stats}
					</View>
				) : isNotYetSetUp ? (
					NotYetSetUp
				) : (
					NoEvents
				))}
		</BaseCard>
	)
}

export default UpNextCard
