import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import { use, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import BaseCard from '@/components/Cards/base-card'
import { UserKindContext } from '@/components/contexts'
import { loadTimetable } from '@/components/Timetable/timetable-screen'
import Divider from '@/components/Universal/Divider'
import { USER_GUEST } from '@/data/constants'
import { useNow } from '@/hooks/useNow'
import { formatFriendlyTime } from '@/utils/date-utils'
import {
	getEventStatus,
	getUpNextCardData,
	shouldShowNextEvent,
	TIMETABLE_IGNORED_ERRORS,
	TIMETABLE_NOT_FOUND_ERROR
} from '@/utils/up-next-utils'
import EventProgressBar from './event-progress-bar'
import EventStatusText from './event-status-text'
import NextEventPreview from './next-event-preview'
import TodayStatsRow from './today-stats-row'

export default function UpNextCard(): React.JSX.Element {
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
	}
}))
