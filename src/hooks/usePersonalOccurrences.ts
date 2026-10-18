import { useMemo } from 'react'
import { useIsFeatureEnabled } from '@/hooks/useFeatureFlag'
import { useNow } from '@/hooks/useNow'
import { usePersonalEventsStore } from '@/hooks/usePersonalEventsStore'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import dayjs from '@/lib/dayjs'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import {
	expandPersonalEvents,
	PERSONAL_EVENTS_FUTURE_DAYS,
	PERSONAL_EVENTS_PAST_DAYS
} from '@/utils/personal-events-utils'

export function usePersonalOccurrences() {
	const events = usePersonalEventsStore((state) => state.events)
	const enabled = useIsFeatureEnabled(FeatureFlagKeys.personalEvents)
	const show = useTimetableStore((state) => state.showPersonalEvents)
	const now = useNow(enabled && show)
	const date = dayjs(now).format('YYYY-MM-DD')
	return useMemo(
		() =>
			enabled && show
				? expandPersonalEvents(
						events,
						dayjs(date).subtract(PERSONAL_EVENTS_PAST_DAYS, 'day').toDate(),
						dayjs(date)
							.add(PERSONAL_EVENTS_FUTURE_DAYS, 'day')
							.endOf('day')
							.toDate()
					)
				: [],
		[events, enabled, show, date]
	)
}
