import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { i18n } from 'i18next'
import type { Calendar } from '@/types/data'
import type { Exams } from '@/types/thi-api'
import type { Exam } from '@/types/utils'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const mockGetExams = mock(async (): Promise<Exams[]> => [])

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'web' },
		Linking: { openURL: async () => {} }
	},
	Platform: { OS: 'web' },
	Linking: { openURL: async () => {} }
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
		getExams: mockGetExams
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
			expect(calendarUtils.isCalendarCardExam(result[0])).toBe(true)
			expect(idOf(result[1])).toBe('soonEvent')
		})

		it('only pins the earliest exam and fills the second slot chronologically', () => {
			const events = [makeCalendarEvent('soonEvent', '2026-06-05T00:00:00')]
			const exams = [
				toCardExam(makeExam('LateExam', '2026-08-01T10:00:00')),
				toCardExam(makeExam('EarlyExam', '2026-07-01T10:00:00'))
			]
			const result = calendarUtils.selectCalendarCardEvents(events, exams, NOW)
			expect(
				calendarUtils.isCalendarCardExam(result[0]) && result[0].examData.name
			).toBe('EarlyExam')
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

		it('prioritizes exams over calendar events when effective times tie', () => {
			const sameBegin = new Date('2026-06-10T00:00:00')
			const events = [
				{
					...makeCalendarEvent('calendar', '2026-06-10T00:00:00'),
					begin: sameBegin
				}
			]
			const exams = [
				{
					...toCardExam(makeExam('TiedExam', '2026-06-10T00:00:00')),
					begin: sameBegin
				}
			]
			const result = calendarUtils.selectCalendarCardEvents(events, exams, NOW)
			expect(calendarUtils.isCalendarCardExam(result[0])).toBe(true)
			expect(
				calendarUtils.isCalendarCardExam(result[0]) && result[0].examData.name
			).toBe('TiedExam')
		})

		it('tie-breaks calendar-vs-exam comparisons in both sort directions', () => {
			const sameBegin = new Date('2026-06-10T00:00:00')
			const events = [
				{
					...makeCalendarEvent('calendarA', '2026-06-10T00:00:00'),
					begin: sameBegin
				},
				{
					...makeCalendarEvent('calendarB', '2026-06-10T00:00:00'),
					begin: sameBegin
				}
			]
			const exams = [
				{
					...toCardExam(makeExam('TiedExam', '2026-06-10T00:00:00')),
					begin: sameBegin
				}
			]
			const result = calendarUtils.selectCalendarCardEvents(events, exams, NOW)
			expect(calendarUtils.isCalendarCardExam(result[0])).toBe(true)
			expect(result).toHaveLength(2)
		})

		it('rehydrates exam dates serialized by persisted React Query cache', () => {
			const events = [makeCalendarEvent('soonEvent', '2026-06-05T00:00:00')]
			const exams = [
				{
					name: 'Math',
					begin: '2026-07-01T10:00:00.000Z' as unknown as Date,
					examData: {
						...makeExam('Math', '2026-07-01T10:00:00'),
						date: '2026-07-01T10:00:00.000Z' as unknown as Date,
						enrollment: '2026-06-01T00:00:00.000Z' as unknown as Date
					}
				}
			]
			const result = calendarUtils.selectCalendarCardEvents(events, exams, NOW)
			expect(calendarUtils.isCalendarCardExam(result[0])).toBe(true)
			expect(result[0].begin).toBeInstanceOf(Date)
			expect(
				calendarUtils.isCalendarCardExam(result[0]) &&
					result[0].examData.date.getTime()
			).toBe(new Date('2026-07-01T10:00:00').getTime())
		})
	})

	describe('loadExamList', () => {
		it('returns an empty array when the API has no exams', async () => {
			mockGetExams.mockReset()
			mockGetExams.mockResolvedValue([])

			await expect(calendarUtils.loadExamList()).resolves.toEqual([])
		})

		it('filters internship-like exams and maps API fields', async () => {
			mockGetExams.mockReset()
			mockGetExams.mockResolvedValue([
				{
					titel: 'Praktikum',
					pruefungs_art: 'Praktikum',
					exam_rooms: '',
					exam_seat: '',
					anmerkung: '',
					pruefer_namen: [],
					exam_ts: new Date('2026-08-01T10:00:00'),
					exm_date: new Date('2026-08-01T00:00:00'),
					exam_time: new Date('2026-08-01T10:00:00'),
					anm_ts: new Date('2026-07-01T00:00:00'),
					hilfsmittel: ['Notes'],
					modus: '2',
					ancode: 'P'
				} as Exams,
				{
					titel: 'Mathematik',
					pruefungs_art: 'Klausur',
					exam_rooms: 'A101',
					exam_seat: '12',
					anmerkung: 'Taschenrechner erlaubt',
					pruefer_namen: ['Prof. X'],
					exam_ts: new Date('2026-07-01T10:00:00'),
					exm_date: new Date('2026-07-01T00:00:00'),
					exam_time: new Date('2026-07-01T10:00:00'),
					anm_ts: new Date('2026-06-01T00:00:00'),
					hilfsmittel: ['Calculator', 'Calculator'],
					modus: '1',
					ancode: 'K'
				} as Exams
			])

			const result = await calendarUtils.loadExamList()

			expect(result).toHaveLength(1)
			expect(result[0]).toEqual({
				name: 'Mathematik',
				type: 'Klausur',
				rooms: 'A101',
				seat: '12',
				notes: 'Taschenrechner erlaubt',
				examiners: ['Prof. X'],
				date: new Date('2026-07-01T10:00:00'),
				enrollment: new Date('2026-06-01T00:00:00'),
				aids: ['Calculator']
			})
		})
	})

	describe('convertCalendarToWeekViewEvents', () => {
		const i18nMock = { language: 'de' } as i18n

		it('maps all-day events to midnight boundaries', () => {
			const entries: Calendar[] = [
				{
					id: 'holiday',
					name: { de: 'Feiertag', en: 'Holiday' },
					begin: new Date('2026-06-04T00:00:00'),
					end: new Date('2026-06-05T00:00:00'),
					hasHours: false
				}
			]

			const [event] = calendarUtils.convertCalendarToWeekViewEvents(
				entries,
				i18nMock,
				'#123456',
				'#ffffff'
			)

			expect(event.title).toBe('Feiertag')
			expect(event.color).toBe('#123456')
			expect(event.textColor).toBe('#ffffff')
			expect(event.start.getHours()).toBe(0)
			expect(event.end.getHours()).toBe(0)
		})

		it('keeps timed events at their original start and end', () => {
			const begin = new Date('2026-06-04T08:15:00')
			const end = new Date('2026-06-04T09:45:00')
			const entries: Calendar[] = [
				{
					id: 'lecture',
					name: { de: 'Vorlesung', en: 'Lecture' },
					begin,
					end,
					hasHours: true
				}
			]

			const [event] = calendarUtils.convertCalendarToWeekViewEvents(
				entries,
				i18nMock,
				'#654321',
				'#000000'
			)

			expect(event.start).toBe(begin)
			expect(event.end).toBe(end)
			expect(event.title).toBe('Vorlesung')
		})
	})

	describe('getNextReRegistrationEvent', () => {
		const getReregEvents = () =>
			calendarUtils.calendar.filter((event) => event.id.startsWith('rereg-'))

		it('returns the soonest upcoming re-registration event', () => {
			const reregEvents = getReregEvents()
			expect(reregEvents.length).toBeGreaterThan(0)

			const earliestBegin = reregEvents.reduce(
				(min, event) => Math.min(min, event.begin.getTime()),
				Number.POSITIVE_INFINITY
			)
			const referenceDate = new Date(earliestBegin - 86_400_000)
			const expected = [...reregEvents]
				.filter((event) => event.begin > referenceDate)
				.sort((a, b) => a.begin.getTime() - b.begin.getTime())[0]

			expect(calendarUtils.getNextReRegistrationEvent(referenceDate)).toEqual(
				expected
			)
		})

		it('returns undefined when no re-registration event lies in the future', () => {
			const reregEvents = getReregEvents()
			expect(reregEvents.length).toBeGreaterThan(0)

			const latestBegin = reregEvents.reduce(
				(max, event) => Math.max(max, event.begin.getTime()),
				Number.NEGATIVE_INFINITY
			)
			const referenceDate = new Date(latestBegin + 86_400_000)

			expect(
				calendarUtils.getNextReRegistrationEvent(referenceDate)
			).toBeUndefined()
		})
	})
})
