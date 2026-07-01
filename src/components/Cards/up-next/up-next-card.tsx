import { useQuery } from '@tanstack/react-query'
import { use, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import BaseCard from '@/components/Cards/base-card'
import { UserKindContext } from '@/components/contexts'
import Divider from '@/components/Universal/divider'
import { USER_GUEST } from '@/data/constants'
import { useNow } from '@/hooks/useNow'
import { formatFriendlyTime } from '@/utils/date-utils'
import { loadTimetable } from '@/utils/timetable-utils'
import { toColor } from '@/utils/uniwind-utils'
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
	const borderColor = toColor(useCSSVariable('--color-border'))
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { t } = useTranslation(['navigation', 'timetable'])
	const isLoggedIn = userKind !== USER_GUEST
	const now = useNow(isLoggedIn)

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
					<View className="gap-2 pt-2">
						<View className="flex-row justify-between items-center">
							<Text className="text-text text-sm tabular-nums">
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

						<View className="gap-1">
							<Text
								className="text-text text-base font-semibold leading-5"
								numberOfLines={2}
							>
								{cardData.currentEvent.name}
							</Text>
							{cardData.currentEvent.rooms.length > 0 && (
								<View className="flex-row items-center mt-0.5">
									<Text className="text-label text-[15px]">
										{cardData.currentEvent.rooms.join(', ')}
									</Text>
								</View>
							)}
						</View>

						{cardData.todayStats.total > 0 && (
							<Divider width="100%" color={borderColor} />
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
					<View className="pt-2">
						<Text className="text-text text-base font-medium">
							{t('timetable:error.empty.subtitle')}
						</Text>
					</View>
				) : (
					<View className="pt-2">
						<Text className="text-text text-base font-medium">
							{t('cards.timetable.noEvents')}
						</Text>
						<Text className="text-label text-sm">
							{t('cards.timetable.enjoyDay')}
						</Text>
					</View>
				))}
		</BaseCard>
	)
}
