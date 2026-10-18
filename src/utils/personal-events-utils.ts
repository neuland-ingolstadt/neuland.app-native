import dayjs from '@/lib/dayjs'
import type {
	PersonalEvent,
	PersonalEventDraft,
	PersonalEventOccurrence
} from '@/types/personal-events'

export const MAX_OCCURRENCES = 1000
export const PERSONAL_EVENTS_PAST_DAYS = 31
export const PERSONAL_EVENTS_FUTURE_DAYS = 180

export function createPersonalEventId(): string {
	return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export type PersonalEventValidationError =
	| 'titleRequired'
	| 'titleTooLong'
	| 'locationTooLong'
	| 'invalidTime'
	| 'singleDay'
	| 'untilRequired'
	| 'untilBeforeStart'
	| 'untilTooLate'

export function validatePersonalEvent(
	draft: PersonalEventDraft
): PersonalEventValidationError[] {
	const errors: PersonalEventValidationError[] = []
	const start = dayjs(draft.start)
	const end = dayjs(draft.end)
	if (!draft.title.trim()) errors.push('titleRequired')
	if (draft.title.length > 80) errors.push('titleTooLong')
	if ((draft.location?.length ?? 0) > 80) errors.push('locationTooLong')
	if (!start.isValid() || !end.isValid() || !end.isAfter(start))
		errors.push('invalidTime')
	if (start.isValid() && end.isValid() && !start.isSame(end, 'day'))
		errors.push('singleDay')
	if (draft.recurrence !== 'none') {
		const until = draft.recurrenceUntil ? dayjs(draft.recurrenceUntil) : null
		if (!until?.isValid()) errors.push('untilRequired')
		else if (start.isValid()) {
			if (until.startOf('day').isBefore(start.startOf('day')))
				errors.push('untilBeforeStart')
			if (until.startOf('day').isAfter(start.add(2, 'year').startOf('day')))
				errors.push('untilTooLate')
		}
	}
	return errors
}

export function expandPersonalEvents(
	events: PersonalEvent[],
	rangeStart: Date,
	rangeEnd: Date
): PersonalEventOccurrence[] {
	if (
		!dayjs(rangeStart).isValid() ||
		!dayjs(rangeEnd).isValid() ||
		rangeEnd < rangeStart
	)
		return []
	const occurrences: PersonalEventOccurrence[] = []
	for (const event of events) {
		const base = dayjs(event.start)
		const baseEnd = dayjs(event.end)
		if (
			!base.isValid() ||
			!baseEnd.isAfter(base) ||
			!base.isSame(baseEnd, 'day')
		)
			continue
		const unit = { daily: 'day', weekly: 'week', monthly: 'month' } as const
		const repeatUnit =
			event.recurrence === 'none' ? undefined : unit[event.recurrence]
		const until =
			repeatUnit && event.recurrenceUntil
				? dayjs(event.recurrenceUntil).endOf('day')
				: base
		if (!until.isValid()) continue
		// Jump near the window so old series cannot exhaust the iteration cap.
		const first = repeatUnit
			? Math.max(0, dayjs(rangeStart).diff(base, repeatUnit) - 1)
			: 0
		for (let offset = first; offset < first + MAX_OCCURRENCES; offset++) {
			// Always add to the base: monthly clamping must not move March to February's day.
			const start = repeatUnit ? base.add(offset, repeatUnit) : base
			if (start.isAfter(until) || start.isAfter(rangeEnd)) break
			const end = start
				.hour(baseEnd.hour())
				.minute(baseEnd.minute())
				.second(baseEnd.second())
				.millisecond(baseEnd.millisecond())
			if (end.isAfter(rangeStart))
				occurrences.push({
					eventType: 'personal',
					id: `${event.id}_${start.valueOf()}`,
					seriesId: event.id,
					name: event.title,
					location: event.location,
					date: start.startOf('day').toDate(),
					startDate: start.toDate(),
					endDate: end.toDate(),
					recurrence: event.recurrence
				})
			if (!repeatUnit) break
		}
	}
	return occurrences.sort(
		(a, b) => a.startDate.getTime() - b.startDate.getTime()
	)
}

export function getUpcomingPersonalOccurrences(
	events: PersonalEvent[],
	now: Date,
	limit: number
): PersonalEventOccurrence[] {
	if (limit <= 0) return []
	const lastDate = events.reduce((latest, event) => {
		const date = dayjs(event.recurrenceUntil ?? event.end).endOf('day')
		return date.isAfter(latest) ? date : latest
	}, dayjs(now))
	return expandPersonalEvents(events, now, lastDate.toDate()).slice(0, limit)
}

export function personalOccurrencesToWeekEvents(
	occurrences: PersonalEventOccurrence[]
) {
	// CalendarKit's recurrence field is an RRULE. These occurrences are already expanded.
	return occurrences.map((entry) => ({
		id: entry.id,
		seriesId: entry.seriesId,
		eventType: entry.eventType,
		name: entry.name,
		title: entry.name,
		rooms: entry.location,
		start: { dateTime: entry.startDate },
		end: { dateTime: entry.endDate }
	}))
}
