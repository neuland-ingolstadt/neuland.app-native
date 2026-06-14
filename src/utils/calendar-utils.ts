import type { i18n } from 'i18next'
import API from '@/api/authenticated-api'
import rawCalendar from '@/data/calendar.json'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar, Semester } from '@/types/data'
import type { CalendarEvent, Exam } from '@/types/utils'

import { ignoreTime } from './date-utils'

export const compileTime = new Date()

// Extract and flatten events from all semesters
export const calendar: Calendar[] = rawCalendar.semesters
	.flatMap((semester: Semester) =>
		semester.events.map((event) => ({
			...event,
			semesterName: semester.name
		}))
	)
	.map((x: unknown) => {
		const event: Calendar = {
			...(x as Calendar),
			begin: new Date((x as Calendar).begin),
			end:
				(x as Calendar).end != null
					? new Date((x as Calendar).end as unknown as string)
					: undefined
		}

		return event
	})
	.filter(
		(x) => (x.end != null && x.end > compileTime) || x.begin > compileTime
	)
	.sort((a, b) => (a.end?.getTime() ?? 0) - (b.end?.getTime() ?? 0))
	.sort((a, b) => a.begin.getTime() - b.begin.getTime())

// Get the raw semesters for displaying in sections
export const semesters = rawCalendar.semesters
	.filter((semester) =>
		semester.events.some((event) => {
			const beginDate = new Date(event.begin)
			const endDate = event.end ? new Date(event.end) : beginDate
			return endDate > compileTime
		})
	)
	.map((semester) => ({
		...semester,
		events: semester.events
			.map((event) => ({
				...event,
				begin: new Date(event.begin),
				end: event.end ? new Date(event.end) : undefined
			}))
			.filter(
				(event) =>
					(event.end && event.end > compileTime) || event.begin > compileTime
			)
			.sort((a, b) => a.begin.getTime() - b.begin.getTime())
	}))

/**
 * Fetches and parses the exam list
 * @returns {object[]}
 */
export async function loadExamList(): Promise<Exam[]> {
	const examList = await API.getExams()
	if (examList.length === 0) {
		return []
	}
	return (
		examList
			// Modus 2 seems to be an indicator for "not real" exams like internships, which still got listed in API.getExams()
			.filter((x) => x.modus !== '2')
			.map((exam) => ({
				name: exam.titel,
				type: exam.pruefungs_art,
				rooms: exam.exam_rooms,
				seat: exam.exam_seat,
				notes: exam.anmerkung,
				examiners: exam.pruefer_namen,
				date: new Date(exam.exam_ts),
				enrollment: new Date(exam.anm_ts),
				aids: exam.hilfsmittel?.filter((v, i, a) => a.indexOf(v) === i) ?? []
			}))
			// sort list in chronologically order
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	)
}

export function convertCalendarToWeekViewEvents(
	entries: Calendar[],
	i18n: i18n,
	color: string,
	textColor: string
): CalendarEvent[] {
	return entries.map((entry) => {
		const allDay = entry.hasHours === false || !entry.hasHours
		const endDate = entry.end ?? entry.begin

		return {
			start: allDay ? ignoreTime(entry.begin) : entry.begin,
			end: allDay ? ignoreTime(endDate) : endDate,
			title: entry?.name[i18n.language as LanguageKey],
			color,
			textColor
		}
	})
}

/**
 * Returns the next upcoming re-registration event.
 *
 * The personal data API does not provide a unique semester identifier
 * before the user has completed re-enrolment. Instead it only contains
 * a placeholder such as "das nächste Semester". To reliably determine
 * which term the user should re-register for we rely on calendar entries
 * whose ids start with `rereg-`.
 */
export function getNextReRegistrationEvent(
	referenceDate: Date = new Date()
): Calendar | undefined {
	// Filter all re-registration events that lie in the future and
	// return the soonest one. This event id is used to decide whether
	// the user has already dismissed the warning for the current term.
	return calendar
		.filter((event) => event.id.startsWith('rereg-'))
		.filter((event) => event.begin > referenceDate)
		.sort((a, b) => a.begin.getTime() - b.begin.getTime())[0]
}

export interface CalendarCardExamInput {
	name: string
	begin: Date
	end?: Date
	examData: Exam
}

export type CalendarCardCalendarEvent = Calendar & { isExam: false }

export interface CalendarCardExamEvent {
	isExam: true
	name: string
	begin: Date
	end?: Date
	examData: Exam
}

export type CalendarCardEvent =
	| CalendarCardCalendarEvent
	| CalendarCardExamEvent

export function isCalendarCardExam(
	event: CalendarCardEvent
): event is CalendarCardExamEvent {
	return event.isExam === true
}

/**
 * Returns the next relevant moment of an event as a timestamp.
 *
 * For events that have not started yet this is the begin date, for events
 * that are already ongoing it is the end date (the next deadline). Single-day
 * events without an end always use their begin date.
 */
export function getCalendarCardEffectiveTime(
	item: { begin: Date; end?: Date },
	now: Date
): number {
	return item.begin.getTime() > now.getTime()
		? item.begin.getTime()
		: (item.end ?? item.begin).getTime()
}

/**
 * Selects the (up to) two events shown on the calendar dashboard card.
 *
 * Events are ranked by their next relevant moment (see
 * {@link getCalendarCardEffectiveTime}). The next upcoming exam is always
 * pinned to the first row, regardless of chronological order; the remaining
 * slot is filled with the next event by effective time. When no exam is
 * available, the two chronologically next events are returned.
 */
export function selectCalendarCardEvents(
	calendarEvents: Calendar[],
	exams: CalendarCardExamInput[],
	now: Date = new Date()
): CalendarCardEvent[] {
	const combined: CalendarCardEvent[] = [
		...calendarEvents.map(
			(item): CalendarCardCalendarEvent => ({
				...item,
				begin: new Date(item.begin),
				isExam: false
			})
		),
		...exams.map(
			(item): CalendarCardExamEvent => ({
				name: item.name,
				begin: new Date(item.begin),
				end: item.end,
				isExam: true,
				examData: item.examData
			})
		)
	]
		.filter((x) => x.begin > now || (x.end ?? now) > now)
		.sort((a, b) => {
			const dateComparison =
				getCalendarCardEffectiveTime(a, now) -
				getCalendarCardEffectiveTime(b, now)
			if (dateComparison !== 0) {
				return dateComparison
			}

			// Same effective time: prioritize exams over calendar events
			if (isCalendarCardExam(a) && !isCalendarCardExam(b)) return -1
			if (!isCalendarCardExam(a) && isCalendarCardExam(b)) return 1

			return 0
		})

	// Always pin the next upcoming exam to the first row, then fill the
	// remaining slot with the chronologically next non-pinned event.
	const nextExam = combined.find(isCalendarCardExam)
	if (nextExam) {
		const rest = combined.filter((item) => item !== nextExam)
		return [nextExam, ...rest].slice(0, 2)
	}
	return combined.slice(0, 2)
}
