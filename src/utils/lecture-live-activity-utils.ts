import type { LectureLiveActivityProps } from '@/types/lecture-live-activity'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { getEventStatus, getTodayEvents } from '@/utils/up-next-utils'

type Translate = (key: string, options?: Record<string, unknown>) => string

/** Show the Live Activity this long before a lecture starts (reminder window). */
export const LECTURE_LIVE_ACTIVITY_LEAD_MS = 15 * 60 * 1000

export function getLectureEventId(event: FriendlyTimetableEntry): string {
	return [
		event.name,
		new Date(event.startDate).toISOString(),
		event.rooms.join(',')
	].join('|')
}

/**
 * Reminder-only: true when the lecture has not started yet and is within the lead window.
 */
export function shouldPresentLectureLiveActivity(
	event: FriendlyTimetableEntry | null,
	now: Date
): event is FriendlyTimetableEntry {
	if (event == null) {
		return false
	}

	const start = new Date(event.startDate).getTime()
	const nowMs = now.getTime()

	if (start <= nowMs) {
		return false
	}

	return start - nowMs <= LECTURE_LIVE_ACTIVITY_LEAD_MS
}

export function buildLectureLiveActivityProps(
	event: FriendlyTimetableEntry,
	now: Date,
	t: Translate
): LectureLiveActivityProps {
	const status = getEventStatus(event, now)
	const phase = status.isOngoing
		? 'ongoing'
		: new Date(event.endDate) <= now
			? 'done'
			: 'upcoming'

	let statusLabel = ''
	let countdownLabel = ''
	if (phase === 'ongoing') {
		statusLabel = status.isEndingSoon
			? t('cards.timetable.endingSoon', {
					ns: 'navigation',
					count: status.timeRemaining
				})
			: t('cards.timetable.ongoing', {
					ns: 'navigation',
					time: formatFriendlyTime(event.endDate)
				})
		countdownLabel = t('cards.timetable.liveActivity.left', {
			ns: 'navigation'
		})
	} else if (phase === 'upcoming') {
		statusLabel = status.isSoon
			? t('cards.timetable.startingSoon', {
					ns: 'navigation',
					count: status.timeRemaining
				})
			: `${formatFriendlyTime(event.startDate)} – ${formatFriendlyTime(event.endDate)}`
		countdownLabel = t('cards.timetable.liveActivity.untilStart', {
			ns: 'navigation'
		})
	} else {
		statusLabel = t('cards.timetable.noMoreLectures', { ns: 'navigation' })
		countdownLabel = t('cards.timetable.liveActivity.done', {
			ns: 'navigation'
		})
	}

	return {
		eventId: getLectureEventId(event),
		title: event.name,
		room: event.rooms.join(', '),
		phase,
		startEpochMs: new Date(event.startDate).getTime(),
		endEpochMs: new Date(event.endDate).getTime(),
		syncEpochMs: now.getTime(),
		statusLabel,
		timeLabel: `${formatFriendlyTime(event.startDate)} – ${formatFriendlyTime(event.endDate)}`,
		countdownLabel
	}
}

/**
 * Picks the soonest upcoming lecture in the reminder window.
 * Back-to-back: last 15 min of lecture A surface lecture B's reminder.
 */
export function getLectureLiveActivityEvent(
	timetable: FriendlyTimetableEntry[],
	now: Date
): FriendlyTimetableEntry | null {
	const nowMs = now.getTime()
	const upcomingToday = getTodayEvents(timetable, now)
		.filter((event) => new Date(event.startDate).getTime() > nowMs)
		.sort(
			(a, b) =>
				new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
		)

	const inLeadWindow = upcomingToday.find((event) =>
		shouldPresentLectureLiveActivity(event, now)
	)

	return inLeadWindow ?? null
}
