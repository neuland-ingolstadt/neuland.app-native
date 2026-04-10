import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { Calendar } from '@/types/data'
import type { Exam, FriendlyTimetableEntry } from '@/types/utils'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'web' },
		Share: { share: () => Promise.resolve() },
		NativeEventEmitter: class {
			addListener() {
				return { remove: () => {} }
			}
			removeAllListeners() {}
		},
		TurboModuleRegistry: {
			get: () => null,
			getEnforcing: () => null
		}
	},
	Platform: { OS: 'web' },
	Share: { share: () => Promise.resolve() },
	NativeEventEmitter: class {
		addListener() {
			return { remove: () => {} }
		}
		removeAllListeners() {}
	},
	TurboModuleRegistry: {
		get: () => null,
		getEnforcing: () => null
	}
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

const mockGetTimetable = mock(
	async (): Promise<{
		timetable: unknown[]
		holidays: unknown[]
		semester: unknown[]
	}> => ({
		timetable: [],
		holidays: [],
		semester: []
	})
)

mock.module(`${SRC_ROOT}api/authenticated-api.ts`, () => ({
	default: {
		getTimetable: mockGetTimetable
	}
}))

let timetableUtils: typeof import('../timetable-utils')

const formatUtcDate = (date: Date): string => date.toISOString().slice(0, 10)

beforeAll(async () => {
	timetableUtils = await import('../timetable-utils')
})

describe('timetable-utils', () => {
	// Same calendar day from current + next month: days match by `getTime()`, slot arrays
	// are concatenated so overlapping days keep all lectures.
	it('getFriendlyTimetable - Should merge overlapping days across month requests and map lecture fields', async () => {
		mockGetTimetable.mockReset()
		const firstDate = new Date('2026-04-07T00:00:00')
		const secondDate = new Date('2026-04-07T00:00:00')
		mockGetTimetable
			.mockResolvedValueOnce({
				timetable: [
					{
						date: firstDate,
						hours: {
							1: [
								{
									von: new Date('2026-04-07T08:15:00'),
									bis: new Date('2026-04-07T09:45:00'),
									lvId: 'A',
									details: {
										raum: 'g101, g102',
										fach: 'Mathematik',
										veranstaltung: 'MATH - Mathematik 1',
										dozent: 'Prof. X',
										stg: 'INF',
										stgru: 'INF1',
										teilgruppe: '',
										sws: '2',
										ectspoints: '5',
										pruefung: 'Klausur',
										ziel: null,
										inhalt: null,
										literatur: null
									}
								}
							]
						}
					}
				],
				holidays: [],
				semester: []
			})
			.mockResolvedValueOnce({
				timetable: [
					{
						date: secondDate,
						hours: {
							1: [
								{
									von: new Date('2026-04-07T10:00:00'),
									bis: new Date('2026-04-07T11:30:00'),
									lvId: 'B',
									details: {
										raum: 'h201',
										fach: 'Programmierung',
										veranstaltung: 'PRG - Programmierung 2',
										dozent: 'Prof. Y',
										stg: 'INF',
										stgru: 'INF1',
										teilgruppe: '',
										sws: '2',
										ectspoints: '5',
										pruefung: 'Klausur',
										ziel: null,
										inhalt: null,
										literatur: null
									}
								}
							]
						}
					}
				],
				holidays: [],
				semester: []
			})

		const result = await timetableUtils.getFriendlyTimetable(
			new Date('2026-04-01T00:00:00'),
			true
		)

		expect(mockGetTimetable).toHaveBeenCalledTimes(2)
		expect(result).toHaveLength(2)
		expect(result.map((entry) => entry.shortName)).toEqual(['MATH', 'PRG'])
		expect(result[0].rooms).toEqual(['G101', 'G102'])
		expect(result[1].rooms).toEqual(['H201'])
		expect(formatUtcDate(result[0].date)).toBe(formatUtcDate(result[1].date))
		expect(formatUtcDate(result[0].date)).toBe('2026-04-07')
	})

	it('getGroupedTimetable - Should group timetable, exams and calendar entries correctly', () => {
		const timetable: FriendlyTimetableEntry[] = [
			{
				date: new Date('2026-04-07T00:00:00'),
				startDate: new Date('2026-04-07T08:00:00'),
				endDate: new Date('2026-04-07T09:30:00'),
				name: 'Mathe',
				shortName: 'MATH',
				rooms: ['G101'],
				lecturer: 'Prof. X',
				course: 'INF',
				studyGroup: 'INF1',
				sws: '2',
				ects: '5',
				goal: null,
				contents: null,
				literature: null
			}
		]

		const exams: Exam[] = [
			{
				name: 'Mathe Klausur',
				type: 'Klausur 120 Minuten',
				rooms: 'G101',
				seat: 'A1',
				notes: '',
				examiners: ['Prof. X'],
				date: new Date('2026-04-07T10:00:00'),
				enrollment: new Date('2026-03-01T00:00:00'),
				aids: []
			}
		]

		const calendarEvents: Calendar[] = [
			{
				id: '1',
				name: { de: 'Feiertag', en: 'Holiday' },
				begin: new Date('2026-04-08T00:00:00'),
				end: new Date('2026-04-09T00:00:00'),
				hasHours: false
			}
		]

		const grouped = timetableUtils.getGroupedTimetable(
			timetable,
			exams,
			true,
			calendarEvents
		)

		expect(grouped).toHaveLength(3)
		expect(formatUtcDate(grouped[0].title)).toBe('2026-04-07')
		expect(grouped[0].data).toHaveLength(2)
		expect(formatUtcDate(grouped[1].title)).toBe('2026-04-08')
		expect(formatUtcDate(grouped[2].title)).toBe('2026-04-09')
	})

	it('convertTimetableToWeekViewEvents - Should map color, title and room', () => {
		const entries: FriendlyTimetableEntry[] = [
			{
				date: new Date('2026-04-07T00:00:00'),
				startDate: new Date('2026-04-07T08:00:00'),
				endDate: new Date('2026-04-07T09:30:00'),
				name: 'Mathe',
				shortName: 'MATH',
				rooms: ['G101'],
				lecturer: 'Prof. X',
				course: 'INF',
				studyGroup: 'INF1',
				sws: '2',
				ects: '5',
				goal: null,
				contents: null,
				literature: null
			}
		]

		const events = timetableUtils.convertTimetableToWeekViewEvents(
			entries,
			'#123456',
			'#ffffff'
		)

		expect(events).toHaveLength(1)
		expect(events[0].title).toBe('MATH')
		expect(events[0].color).toBe('#123456')
		expect(events[0].textColor).toBe('#ffffff')
		expect(events[0].location).toBe('G101')
	})

	it('generateKey - Should create a stable key', () => {
		const start = new Date('2026-04-07T08:15:00')
		const key = timetableUtils.generateKey('Mathe', start, 'G101')
		expect(key).toBe(`Mathe-${start.getTime().toString()}-G101`)
	})

	it('isValidRoom - Should accept valid and reject invalid room formats', () => {
		expect(timetableUtils.isValidRoom('G101')).toBe(true)
		expect(timetableUtils.isValidRoom('BN201')).toBe(true)
		expect(timetableUtils.isValidRoom('BU12')).toBe(true)
		expect(timetableUtils.isValidRoom('101G')).toBe(false)
		expect(timetableUtils.isValidRoom('G1')).toBe(false)
		expect(timetableUtils.isValidRoom('G-101')).toBe(false)
	})

	it('loadTimetable - Should throw an error for an empty timetable', async () => {
		mockGetTimetable.mockReset()
		mockGetTimetable.mockResolvedValue({
			timetable: [],
			holidays: [],
			semester: []
		})

		await expect(timetableUtils.loadTimetable()).rejects.toThrow(
			'Timetable is empty'
		)
	})

	it('loadTimetable - Should return entries when timetable data exists', async () => {
		mockGetTimetable.mockReset()
		mockGetTimetable
			.mockResolvedValueOnce({
				timetable: [
					{
						date: new Date('2026-04-07T00:00:00'),
						hours: {
							1: [
								{
									von: new Date('2026-04-07T08:15:00'),
									bis: new Date('2026-04-07T09:45:00'),
									lvId: 'A',
									details: {
										raum: 'g101',
										fach: 'Mathematik',
										veranstaltung: 'MATH - Mathematik 1',
										dozent: 'Prof. X',
										stg: 'INF',
										stgru: 'INF1',
										teilgruppe: '',
										sws: '2',
										ectspoints: '5',
										pruefung: 'Klausur',
										ziel: null,
										inhalt: null,
										literatur: null
									}
								}
							]
						}
					}
				],
				holidays: [],
				semester: []
			})
			.mockResolvedValueOnce({
				timetable: [],
				holidays: [],
				semester: []
			})

		const result = await timetableUtils.loadTimetable()
		expect(result).toHaveLength(1)
		expect(result[0].shortName).toBe('MATH')
	})
})
