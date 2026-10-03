import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, type AppStateStatus, Platform } from 'react-native'
import { useUserKind } from '@/contexts/userKind'
import { USER_GUEST } from '@/data/constants'
import { useAppState } from '@/hooks/useAppState'
import { useInterval } from '@/hooks/useInterval'
import type { FriendlyTimetableEntry } from '@/types/utils'
import {
	buildLectureLiveActivityProps,
	getLectureLiveActivityEvent
} from '@/utils/lecture-live-activity-utils'
import {
	loadTimetable,
	TIMETABLE_GC_TIME_MS,
	TIMETABLE_STALE_TIME_MS
} from '@/utils/timetable-utils'
import { TIMETABLE_IGNORED_ERRORS } from '@/utils/up-next-utils'

type Translate = (key: string, options?: Record<string, unknown>) => string

const TICK_MS = 60 * 1000
const DEEP_LINK = 'neuland://timetable'

/**
 * Starts / updates / ends an iOS Live Activity for the next or ongoing lecture.
 * No-ops for guests and on Android/web.
 */
export function useLectureLiveActivitySync(): void {
	const { t } = useTranslation(['navigation', 'timetable'])
	const { userKind } = useUserKind()
	const isLoggedIn = userKind != null && userKind !== USER_GUEST
	const enabled = Platform.OS === 'ios' && isLoggedIn
	const [now, setNow] = useState(() => new Date())
	const [appState, setAppState] = useState<AppStateStatus>(
		() => (AppState.currentState as AppStateStatus | null) ?? 'active'
	)

	const { data: timetable } = useQuery({
		queryKey: ['timetableV2', userKind],
		queryFn: loadTimetable,
		staleTime: TIMETABLE_STALE_TIME_MS,
		gcTime: TIMETABLE_GC_TIME_MS,
		enabled,
		retry(failureCount, queryError) {
			return (
				!TIMETABLE_IGNORED_ERRORS.includes(
					queryError?.message as (typeof TIMETABLE_IGNORED_ERRORS)[number]
				) && failureCount < 2
			)
		}
	})

	useAppState((nextState) => {
		setAppState(nextState)
		if (nextState === 'active' && enabled) {
			setNow(new Date())
		}
	})

	useInterval(
		() => {
			setNow(new Date())
		},
		enabled && appState === 'active' ? TICK_MS : null
	)

	useEffect(() => {
		if (!enabled) {
			if (Platform.OS === 'ios') {
				void endAllLectureLiveActivities()
			}
			return
		}

		void syncLectureLiveActivity(timetable, now, t as Translate)
	}, [enabled, now, t, timetable])
}

async function endAllLectureLiveActivities(): Promise<void> {
	try {
		const { default: LectureLiveActivity } = await import(
			'@/widgets/lecture-live-activity'
		)
		const instances = LectureLiveActivity.getInstances()
		await Promise.all(instances.map((instance) => instance.end('immediate')))
	} catch (error) {
		console.warn('Failed to end lecture Live Activities', error)
	}
}

async function syncLectureLiveActivity(
	timetable: FriendlyTimetableEntry[] | undefined,
	now: Date,
	t: Translate
): Promise<void> {
	try {
		const { default: LectureLiveActivity } = await import(
			'@/widgets/lecture-live-activity'
		)
		const instances = LectureLiveActivity.getInstances()

		// Keep any existing activity while timetable is still loading.
		if (timetable == null) {
			return
		}

		const event = getLectureLiveActivityEvent(timetable, now)

		if (event == null) {
			await Promise.all(instances.map((instance) => instance.end('immediate')))
			return
		}

		const props = buildLectureLiveActivityProps(event, now, t)
		// Reminder is stale once the lecture starts.
		const staleDate = new Date(event.startDate)

		if (instances.length === 0) {
			LectureLiveActivity.start(props, DEEP_LINK, staleDate)
			return
		}

		await instances[0].update(props, staleDate)
		await Promise.all(
			instances.slice(1).map((instance) => instance.end('immediate'))
		)
	} catch (error) {
		console.warn('Failed to sync lecture Live Activity', error)
	}
}
