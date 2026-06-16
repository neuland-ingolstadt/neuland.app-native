import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import { use, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { loadTimetable } from '@/components/Timetable/timetable-screen'
import Divider from '@/components/Universal/Divider'
import PulsingDot from '@/components/Universal/pulsing-dot'
import { USER_GUEST } from '@/data/constants'
import { useNow } from '@/hooks/useNow'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime, formatNearDate } from '@/utils/date-utils'
import type { EventStatus, TodayStats } from '@/utils/up-next-utils'
import {
	getEventStatus,
	getUpNextCardData,
	shouldShowNextEvent,
	TIMETABLE_IGNORED_ERRORS,
	TIMETABLE_NOT_FOUND_ERROR
} from '@/utils/up-next-utils'
import { UserKindContext } from '../contexts'
import BaseCard from './base-card'

function EventProgressBar({
	progress
}: {
	progress: number
}): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.progressBarContainer}>
			<View
				style={[
					styles.progressBar,
					{
						width: `${progress * 100}%`
					}
				]}
			/>
		</View>
	)
}

interface EventStatusTextProps {
	event: FriendlyTimetableEntry
	status: EventStatus
}

function EventStatusText({
	event,
	status
}: EventStatusTextProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['navigation', 'timetable'])

	let statusText = ''

	if (status.isOngoing) {
		statusText = status.isEndingSoon
			? t('cards.timetable.endingSoon', { count: status.timeRemaining })
			: t('cards.timetable.ongoing', {
					time: formatFriendlyTime(event.endDate)
				})
	} else if (status.isSoon) {
		statusText = t('cards.timetable.startingSoon', {
			count: status.timeRemaining
		})
	} else {
		statusText = formatNearDate(event.startDate) ?? ''
	}

	return <Text style={styles.eventDate}>{statusText}</Text>
}

interface NextEventPreviewProps {
	event: FriendlyTimetableEntry
}

function NextEventPreview({ event }: NextEventPreviewProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.nextEventContainer}>
			<Text style={styles.nextEventTime}>
				{formatFriendlyTime(event.startDate)}
			</Text>
			<Text style={styles.nextEventName} numberOfLines={1}>
				{'· '}
				{event.name}{' '}
				{event.rooms.length > 0 && (
					<Text style={styles.nextEventRoom}>· {event.rooms.join(', ')}</Text>
				)}
			</Text>
		</View>
	)
}

interface TodayStatsRowProps {
	stats: TodayStats
	nextEvent: React.ReactNode
}

function TodayStatsRow({
	stats,
	nextEvent
}: TodayStatsRowProps): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('navigation')

	if (stats.total === 0) {
		return null
	}

	const statsText =
		stats.remaining > 0
			? t(
					stats.remaining === 1
						? 'cards.timetable.lecturesRemaining_one'
						: 'cards.timetable.lecturesRemaining_plural',
					{ count: stats.remaining }
				)
			: t('cards.timetable.noMoreLectures')

	return (
		<View style={styles.statsContainer}>
			{nextEvent}
			<Pressable
				style={styles.statsRow}
				onPress={() => router.navigate('/dots')}
				hitSlop={10}
			>
				<View style={styles.progressDots}>
					{Array.from({ length: stats.total }).map((_, index) =>
						index < stats.completed ? (
							<View key={index} style={[styles.dot, styles.dotCompleted]} />
						) : index < stats.completed + stats.ongoing ? (
							<PulsingDot key={index} style={[styles.dot, styles.dotOngoing]} />
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
}

const UpNextCard = (): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { t } = useTranslation(['navigation', 'timetable'])
	const [screenIsFocused, setScreenIsFocused] = useState(false)

	const isActive = userKind !== USER_GUEST && screenIsFocused
	const now = useNow(isActive)

	const {
		data: timetable,
		error,
		isSuccess
	} = useQuery({
		queryKey: ['timetableV2', userKind],
		queryFn: loadTimetable,
		staleTime: 10 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
		enabled: userKind !== USER_GUEST,
		retry(failureCount, queryError) {
			return (
				!TIMETABLE_IGNORED_ERRORS.includes(
					queryError?.message as (typeof TIMETABLE_IGNORED_ERRORS)[number]
				) && failureCount < 2
			)
		}
	})

	useFocusEffect(
		useCallback(() => {
			setScreenIsFocused(true)
			return () => {
				setScreenIsFocused(false)
			}
		}, [])
	)

	const cardData = useMemo(() => {
		if (timetable == null) {
			return null
		}

		return getUpNextCardData(timetable, now)
	}, [timetable, now])

	const isNotYetSetUp = error?.message === TIMETABLE_NOT_FOUND_ERROR
	const isReady = isSuccess || isNotYetSetUp

	const eventStatus =
		cardData?.currentEvent != null
			? getEventStatus(cardData.currentEvent, now)
			: null

	const showNextEvent =
		cardData != null &&
		shouldShowNextEvent(cardData.currentEvent, cardData.nextEvent, now)

	return (
		<BaseCard title="timetable" onPressRoute="/timetable">
			{isReady &&
				(cardData?.currentEvent != null && eventStatus != null ? (
					<View style={styles.mainContainer}>
						<View style={styles.eventHeader}>
							<Text style={styles.timeInfo}>
								{formatFriendlyTime(cardData.currentEvent.startDate)} -{' '}
								{formatFriendlyTime(cardData.currentEvent.endDate)}
							</Text>
							<EventStatusText
								event={cardData.currentEvent}
								status={eventStatus}
							/>
						</View>

						{eventStatus.isOngoing && (
							<EventProgressBar progress={eventStatus.progress} />
						)}

						<View style={styles.eventContent}>
							<Text style={styles.eventTitle} numberOfLines={2}>
								{cardData.currentEvent.name}
							</Text>
							{cardData.currentEvent.rooms.length > 0 && (
								<View style={styles.roomContainer}>
									<Text style={styles.roomText}>
										{cardData.currentEvent.rooms.join(', ')}
									</Text>
								</View>
							)}
						</View>

						{cardData.todayStats.total > 0 && (
							<Divider width="100%" color={theme.colors.border} />
						)}

						<TodayStatsRow
							stats={cardData.todayStats}
							nextEvent={
								showNextEvent && cardData.nextEvent != null ? (
									<NextEventPreview event={cardData.nextEvent} />
								) : null
							}
						/>
					</View>
				) : isNotYetSetUp ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyTitle}>
							{t('timetable:error.empty.subtitle')}
						</Text>
					</View>
				) : (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyTitle}>
							{t('cards.timetable.noEvents')}
						</Text>
						<Text style={styles.emptySubtitle}>
							{t('cards.timetable.enjoyDay')}
						</Text>
					</View>
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
		backgroundColor: theme.colors.completedDot
	},
	dotOngoing: {
		backgroundColor: theme.colors.success
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
		fontSize: 14
	},
	nextEventContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		marginTop: 2
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
