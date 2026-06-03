import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { Calendar } from '@/types/data'
import type { Exam } from '@/types/utils'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'web' }
	},
	Platform: { OS: 'web' }
}))

mock.module('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'de' }]
}))

mock.module('react-i18next', () => ({
	initReactI18next: {}
}))

mock.module(`${SRC_ROOT}localization/i18n.ts`, () => ({
	default: { language: 'de' }
}))

mock.module('i18next', () => ({
	t: (key: string) => key
}))

mock.module(`${SRC_ROOT}api/authenticated-api.ts`, () => ({
	default: {
		getExams: async () => []
	}
}))

let calendarUtils: typeof import('../calendar-utils')

beforeAll(async () => {
	calendarUtils = await import('../calendar-utils')
})

const NOW = new Date('2026-06-04T12:00:00')

const makeCalendarEvent = (
	id: string,
	begin: string,
	end?: string
): Calendar => ({
	id,
	name: { de: id, en: id },
	begin: new Date(begin),
	end: end ? new Date(end) : undefined
})

const makeExam = (name: string, date: string): Exam => ({
	name,
	type: 'Klausur',
	rooms: 'A001',
	seat: '1',
	notes: '',
	examiners: [],
	date: new Date(date),
	enrollment: new Date('2026-05-01T00:00:00'),
	aids: []
})

const toCardExam = (exam: Exam) => ({
	name: exam.name,
	begin: new Date(exam.date),
	isExam: true,
	examData: exam
})

const idOf = (event: { id?: string; name: unknown }): string =>
	'id' in event && event.id
		? event.id
		: typeof event.name === 'string'
			? event.name
			: ''

describe('calendar-utils', () => {
	describe('getCalendarCardEffectiveTime', () => {
		it('uses the begin date for events that have not started yet', () => {
			const item = {
				begin: new Date('2026-06-10T00:00:00'),
				end: new Date('2026-06-20T00:00:00')
			}
			expect(calendarUtils.getCalendarCardEffectiveTime(item, NOW)).toBe(
				item.begin.getTime()
			)
		})

		it('uses the end date for events that are already ongoing', () => {
			const item = {
				begin: new Date('2026-06-01T00:00:00'),
				end: new Date('2026-06-20T00:00:00')
			}
			expect(calendarUtils.getCalendarCardEffectiveTime(item, NOW)).toBe(
				item.end.getTime()
			)
		})

		it('falls back to begin when no end date is set', () => {
			const item = { begin: new Date('2026-06-10T00:00:00') }
			expect(calendarUtils.getCalendarCardEffectiveTime(item, NOW)).toBe(
				item.begin.getTime()
			)
		})
	})

	describe('selectCalendarCardEvents', () => {
		it('returns at most two events', () => {
			const events = [
				makeCalendarEvent('a', '2026-06-05T00:00:00'),
				makeCalendarEvent('b', '2026-06-06T00:00:00'),
				makeCalendarEvent('c', '2026-06-07T00:00:00')
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result).toHaveLength(2)
		})

		it('filters out events that lie completely in the past', () => {
			const events = [
				makeCalendarEvent('past', '2026-05-01T00:00:00', '2026-05-10T00:00:00'),
				makeCalendarEvent('future', '2026-06-10T00:00:00')
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result.map(idOf)).toEqual(['future'])
		})

		it('keeps ongoing multi-day events whose end is still in the future', () => {
			const events = [
				makeCalendarEvent(
					'ongoing',
					'2026-06-01T00:00:00',
					'2026-06-20T00:00:00'
				)
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result.map(idOf)).toEqual(['ongoing'])
		})

		it('sorts by the next relevant moment (upcoming single-day before later end)', () => {
			// ongoing event ends 2026-06-30, single-day event begins 2026-06-10
			const events = [
				makeCalendarEvent(
					'ongoing',
					'2026-06-01T00:00:00',
					'2026-06-30T00:00:00'
				),
				makeCalendarEvent('soon', '2026-06-10T00:00:00')
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result.map(idOf)).toEqual(['soon', 'ongoing'])
		})

		it('ranks two ongoing events by their end date', () => {
			const events = [
				makeCalendarEvent(
					'endsLate',
					'2026-06-01T00:00:00',
					'2026-07-10T00:00:00'
				),
				makeCalendarEvent(
					'endsSoon',
					'2026-06-02T00:00:00',
					'2026-06-15T00:00:00'
				)
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result.map(idOf)).toEqual(['endsSoon', 'endsLate'])
		})

		it('pins the next exam to the first row even if a calendar event is earlier', () => {
			const events = [
				makeCalendarEvent('soonEvent', '2026-06-05T00:00:00'),
				makeCalendarEvent('laterEvent', '2026-06-08T00:00:00')
			]
			const exams = [toCardExam(makeExam('Math', '2026-07-01T10:00:00'))]
			const result = calendarUtils.selectCalendarCardEvents(events, exams, NOW)
			expect(result).toHaveLength(2)
			expect((result[0] as { isExam?: boolean }).isExam).toBe(true)
			expect(idOf(result[1])).toBe('soonEvent')
		})

		it('only pins the earliest exam and fills the second slot chronologically', () => {
			const events = [makeCalendarEvent('soonEvent', '2026-06-05T00:00:00')]
			const exams = [
				toCardExam(makeExam('LateExam', '2026-08-01T10:00:00')),
				toCardExam(makeExam('EarlyExam', '2026-07-01T10:00:00'))
			]
			const result = calendarUtils.selectCalendarCardEvents(events, exams, NOW)
			expect((result[0] as { examData?: Exam }).examData?.name).toBe(
				'EarlyExam'
			)
			expect(idOf(result[1])).toBe('soonEvent')
		})

		it('returns the two chronologically next events when no exam is present', () => {
			const events = [
				makeCalendarEvent('first', '2026-06-05T00:00:00'),
				makeCalendarEvent('second', '2026-06-06T00:00:00'),
				makeCalendarEvent('third', '2026-06-07T00:00:00')
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result.map(idOf)).toEqual(['first', 'second'])
		})

		it('returns an empty array when there are no upcoming events', () => {
			const events = [
				makeCalendarEvent('past', '2026-05-01T00:00:00', '2026-05-10T00:00:00')
			]
			const result = calendarUtils.selectCalendarCardEvents(events, [], NOW)
			expect(result).toEqual([])
		})
	})
})
