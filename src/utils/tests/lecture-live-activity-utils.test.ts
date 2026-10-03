import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { FriendlyTimetableEntry } from '@/types/utils'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

mock.module(`${SRC_ROOT}localization/i18n.ts`, () => ({
	default: { language: 'en' }
}))

mock.module('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'en' }]
}))

mock.module('react-i18next', () => ({
	initReactI18next: {}
}))

mock.module('i18next', () => ({
	t: (key: string) => key,
	default: {
		language: 'en',
		t: (key: string) => key
	}
}))

let buildLectureLiveActivityProps: typeof import('../lecture-live-activity-utils').buildLectureLiveActivityProps
let getLectureLiveActivityEvent: typeof import('../lecture-live-activity-utils').getLectureLiveActivityEvent
let LECTURE_LIVE_ACTIVITY_LEAD_MS: typeof import('../lecture-live-activity-utils').LECTURE_LIVE_ACTIVITY_LEAD_MS
let shouldPresentLectureLiveActivity: typeof import('../lecture-live-activity-utils').shouldPresentLectureLiveActivity

beforeAll(async () => {
	;({
		buildLectureLiveActivityProps,
		getLectureLiveActivityEvent,
		LECTURE_LIVE_ACTIVITY_LEAD_MS,
		shouldPresentLectureLiveActivity
	} = await import('../lecture-live-activity-utils'))
})

function makeEvent(
	now: Date,
	startOffsetMin: number,
	endOffsetMin: number,
	overrides: Partial<FriendlyTimetableEntry> = {}
): FriendlyTimetableEntry {
	const startDate = new Date(now.getTime() + startOffsetMin * 60_000)
	const endDate = new Date(now.getTime() + endOffsetMin * 60_000)

	return {
		date: startDate,
		startDate,
		endDate,
		name: overrides.name ?? 'Mathematics',
		shortName: 'MATH',
		rooms: overrides.rooms ?? ['A123'],
		lecturer: 'Prof. Example',
		lecturerIds: ['1'],
		course: 'CS',
		studyGroup: '1',
		sws: '4',
		ects: '5',
		goal: null,
		contents: null,
		literature: null
	}
}

const t = ((key: string, options?: Record<string, unknown>) => {
	if (key === 'cards.timetable.startingSoon') {
		return `starts in ${String(options?.count)} min`
	}
	if (key === 'cards.timetable.endingSoon') {
		return `ends in ${String(options?.count)} min`
	}
	if (key === 'cards.timetable.ongoing') {
		return `ends at ${String(options?.time)}`
	}
	if (key === 'cards.timetable.liveActivity.left') return 'left'
	if (key === 'cards.timetable.liveActivity.untilStart') return 'until start'
	if (key === 'cards.timetable.liveActivity.done') return 'Done'
	return key
}) as (key: string, options?: Record<string, unknown>) => string

describe('lecture-live-activity-utils', () => {
	it('shouldPresentLectureLiveActivity - rejects ongoing lectures (reminder only)', () => {
		const now = new Date('2026-05-12T10:00:00.000Z')
		const event = makeEvent(now, -15, 45)

		expect(shouldPresentLectureLiveActivity(event, now)).toBe(false)
	})

	it('shouldPresentLectureLiveActivity - accepts lectures within the lead window', () => {
		const now = new Date('2026-05-12T10:00:00.000Z')
		const leadMinutes = LECTURE_LIVE_ACTIVITY_LEAD_MS / 60_000
		const event = makeEvent(now, leadMinutes - 1, leadMinutes + 89)

		expect(shouldPresentLectureLiveActivity(event, now)).toBe(true)
	})

	it('shouldPresentLectureLiveActivity - rejects lectures too far away', () => {
		const now = new Date('2026-05-12T10:00:00.000Z')
		const leadMinutes = LECTURE_LIVE_ACTIVITY_LEAD_MS / 60_000
		const event = makeEvent(now, leadMinutes + 1, leadMinutes + 91)

		expect(shouldPresentLectureLiveActivity(event, now)).toBe(false)
	})

	it('buildLectureLiveActivityProps - formats upcoming reminder props', () => {
		const now = new Date('2026-05-12T10:00:00.000Z')
		const event = makeEvent(now, 10, 100, { rooms: ['A123', 'B001'] })

		const props = buildLectureLiveActivityProps(event, now, t)

		expect(props.phase).toBe('upcoming')
		expect(props.room).toBe('A123, B001')
		expect(props.title).toBe('Mathematics')
		expect(props.countdownLabel).toBe('until start')
		expect(props.syncEpochMs).toBe(now.getTime())
	})

	it('getLectureLiveActivityEvent - returns null when nothing is soon', () => {
		const now = new Date('2026-05-12T10:00:00.000Z')
		const event = makeEvent(now, 5 * 60, 5 * 60 + 90)

		expect(getLectureLiveActivityEvent([event], now)).toBeNull()
	})

	it('getLectureLiveActivityEvent - prefers the next lecture in the lead window over an ongoing one', () => {
		const now = new Date('2026-05-12T10:00:00.000Z')
		const ongoing = makeEvent(now, -60, 10, { name: 'Lecture A' })
		const next = makeEvent(now, 10, 100, { name: 'Lecture B', rooms: ['G215'] })

		const event = getLectureLiveActivityEvent([ongoing, next], now)

		expect(event?.name).toBe('Lecture B')
	})
})
