import { describe, expect, it } from 'bun:test'
import type { FriendlyTimetableEntry } from '@/types/utils'
import {
	getEventStatus,
	getTodayEvents,
	getTodayStats,
	getUpNextCardData,
	shouldShowNextEvent,
	TIMETABLE_EMPTY_ERROR,
	TIMETABLE_IGNORED_ERRORS,
	TIMETABLE_NOT_FOUND_ERROR
} from '../up-next-utils'

const buildEvent = (
	name: string,
	startDate: Date,
	endDate: Date
): FriendlyTimetableEntry => ({
	date: startDate,
	startDate,
	endDate,
	name,
	shortName: name,
	rooms: ['G101'],
	lecturer: 'Prof. X',
	course: 'INF',
	studyGroup: 'INF1',
	sws: '2',
	ects: '5',
	goal: null,
	contents: null,
	literature: null
})

describe('up-next-utils', () => {
	it('exports the ignored timetable error messages', () => {
		expect(TIMETABLE_NOT_FOUND_ERROR).toBe('"Time table does not exist" (-202)')
		expect(TIMETABLE_EMPTY_ERROR).toBe('Timetable is empty')
		expect(TIMETABLE_IGNORED_ERRORS).toEqual([
			TIMETABLE_NOT_FOUND_ERROR,
			TIMETABLE_EMPTY_ERROR
		])
	})

	it('getUpNextCardData - returns ongoing event and the next lecture today', () => {
		const now = new Date('2026-06-16T10:30:00')
		const current = buildEvent(
			'Current lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)
		const later = buildEvent(
			'Later lecture',
			new Date('2026-06-16T12:00:00'),
			new Date('2026-06-16T13:30:00')
		)
		const yesterday = buildEvent(
			'Yesterday lecture',
			new Date('2026-06-15T10:00:00'),
			new Date('2026-06-15T11:30:00')
		)

		const result = getUpNextCardData([yesterday, current, later], now)

		expect(result.currentEvent?.name).toBe('Current lecture')
		expect(result.nextEvent?.name).toBe('Later lecture')
		expect(result.todayStats).toEqual({
			total: 2,
			completed: 0,
			ongoing: 1,
			remaining: 1
		})
	})

	it('getUpNextCardData - returns null events when the day is over', () => {
		const now = new Date('2026-06-16T18:00:00')
		const finished = buildEvent(
			'Morning lecture',
			new Date('2026-06-16T08:00:00'),
			new Date('2026-06-16T09:30:00')
		)

		const result = getUpNextCardData([finished], now)

		expect(result.currentEvent).toBeNull()
		expect(result.nextEvent).toBeNull()
		expect(getTodayStats([finished], now)).toEqual({
			total: 1,
			completed: 1,
			ongoing: 0,
			remaining: 0
		})
	})

	it('getTodayStats - uses exclusive end and inclusive start boundaries', () => {
		const now = new Date('2026-06-16T10:00:00')
		const endingNow = buildEvent(
			'Ending now',
			new Date('2026-06-16T09:00:00'),
			new Date('2026-06-16T10:00:00')
		)
		const startingNow = buildEvent(
			'Starting now',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:00:00')
		)
		const remaining = buildEvent(
			'Later',
			new Date('2026-06-16T12:00:00'),
			new Date('2026-06-16T13:00:00')
		)

		// end == now is neither completed (<) nor ongoing (>), start == now is ongoing
		expect(getTodayStats([endingNow, startingNow, remaining], now)).toEqual({
			total: 3,
			completed: 0,
			ongoing: 1,
			remaining: 1
		})
	})

	it('getUpNextCardData - sorts following events without mutating the source list', () => {
		const now = new Date('2026-06-16T10:30:00')
		const current = buildEvent(
			'Current lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)
		const later = buildEvent(
			'Later lecture',
			new Date('2026-06-16T14:00:00'),
			new Date('2026-06-16T15:00:00')
		)
		const sooner = buildEvent(
			'Sooner lecture',
			new Date('2026-06-16T12:00:00'),
			new Date('2026-06-16T13:00:00')
		)
		const source = [current, later, sooner]
		const originalOrder = source.map((event) => event.name)

		const result = getUpNextCardData(source, now)

		expect(result.nextEvent?.name).toBe('Sooner lecture')
		expect(source.map((event) => event.name)).toEqual(originalOrder)
	})

	it('getUpNextCardData - picks the next lecture after an upcoming current event', () => {
		const now = new Date('2026-06-16T09:00:00')
		const upcoming = buildEvent(
			'Upcoming lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)
		const later = buildEvent(
			'Later lecture',
			new Date('2026-06-16T12:00:00'),
			new Date('2026-06-16T13:30:00')
		)

		const result = getUpNextCardData([upcoming, later], now)

		expect(result.currentEvent?.name).toBe('Upcoming lecture')
		expect(result.nextEvent?.name).toBe('Later lecture')
		expect(getTodayEvents([upcoming, later], now)).toHaveLength(2)
	})

	it('getUpNextCardData - does not treat a lecture starting now as following itself', () => {
		const now = new Date('2026-06-16T10:00:00')
		const current = buildEvent(
			'Starting now',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:00:00')
		)
		const later = buildEvent(
			'Later lecture',
			new Date('2026-06-16T12:00:00'),
			new Date('2026-06-16T13:00:00')
		)

		const result = getUpNextCardData([current, later], now)

		expect(result.currentEvent?.name).toBe('Starting now')
		expect(result.nextEvent?.name).toBe('Later lecture')
	})

	it('getEventStatus - marks an ongoing lecture as ending soon', () => {
		const now = new Date('2026-06-16T11:10:00')
		const event = buildEvent(
			'Current lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)

		const status = getEventStatus(event, now)

		expect(status.isOngoing).toBe(true)
		expect(status.isEndingSoon).toBe(true)
		expect(status.timeRemaining).toBe(20)
		expect(status.progress).toBeCloseTo(70 / 90, 5)
	})

	it('getEventStatus - marks an upcoming lecture as starting soon', () => {
		const now = new Date('2026-06-16T09:45:00')
		const event = buildEvent(
			'Upcoming lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)

		const status = getEventStatus(event, now)

		expect(status.isOngoing).toBe(false)
		expect(status.isSoon).toBe(true)
		expect(status.isEndingSoon).toBe(false)
		expect(status.timeRemaining).toBe(15)
		expect(status.progress).toBe(0)
	})

	it('getEventStatus - uses inclusive start and exclusive end for ongoing', () => {
		const start = new Date('2026-06-16T10:00:00')
		const end = new Date('2026-06-16T11:00:00')
		const event = buildEvent('Boundary lecture', start, end)

		expect(getEventStatus(event, start).isOngoing).toBe(true)
		expect(getEventStatus(event, end).isOngoing).toBe(false)
	})

	it('getEventStatus - treats the 30-minute soon threshold as inclusive', () => {
		const now = new Date('2026-06-16T10:00:00')
		const atThreshold = buildEvent(
			'In 30 minutes',
			new Date('2026-06-16T10:30:00'),
			new Date('2026-06-16T11:30:00')
		)
		const justOver = buildEvent(
			'In 31 minutes',
			new Date('2026-06-16T10:31:00'),
			new Date('2026-06-16T11:31:00')
		)
		const past = buildEvent(
			'Already started',
			new Date('2026-06-16T09:00:00'),
			new Date('2026-06-16T11:00:00')
		)

		expect(getEventStatus(atThreshold, now).isSoon).toBe(true)
		expect(getEventStatus(justOver, now).isSoon).toBe(false)
		expect(getEventStatus(past, now).isSoon).toBe(false)
	})

	it('getEventStatus - treats the 30-minute ending-soon threshold as inclusive', () => {
		const now = new Date('2026-06-16T10:30:00')
		const endingAtThreshold = buildEvent(
			'Ends in 30 minutes',
			new Date('2026-06-16T09:00:00'),
			new Date('2026-06-16T11:00:00')
		)
		const endingLater = buildEvent(
			'Ends in 31 minutes',
			new Date('2026-06-16T09:00:00'),
			new Date('2026-06-16T11:01:00')
		)

		expect(getEventStatus(endingAtThreshold, now).isEndingSoon).toBe(true)
		expect(getEventStatus(endingLater, now).isEndingSoon).toBe(false)
		expect(getEventStatus(endingLater, now).isOngoing).toBe(true)
	})

	it('getEventStatus - clamps progress between 0 and 1', () => {
		const now = new Date('2026-06-16T10:30:00')
		const inverted = buildEvent(
			'Inverted window',
			new Date('2026-06-16T11:00:00'),
			new Date('2026-06-16T10:00:00')
		)

		const status = getEventStatus(inverted, now)

		expect(status.progress).toBeGreaterThanOrEqual(0)
		expect(status.progress).toBeLessThanOrEqual(1)
	})

	it('shouldShowNextEvent - returns false for missing or cross-day events', () => {
		const now = new Date('2026-06-16T10:30:00')
		const current = buildEvent(
			'Current lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)
		const tomorrow = buildEvent(
			'Tomorrow lecture',
			new Date('2026-06-17T12:00:00'),
			new Date('2026-06-17T13:30:00')
		)

		expect(shouldShowNextEvent(null, current, now)).toBe(false)
		expect(shouldShowNextEvent(current, null, now)).toBe(false)
		expect(shouldShowNextEvent(current, tomorrow, now)).toBe(false)
	})

	it('shouldShowNextEvent - hides preview before the current lecture starts', () => {
		const now = new Date('2026-06-16T09:00:00')
		const current = buildEvent(
			'Upcoming lecture',
			new Date('2026-06-16T10:00:00'),
			new Date('2026-06-16T11:30:00')
		)
		const next = buildEvent(
			'Later lecture',
			new Date('2026-06-16T12:00:00'),
			new Date('2026-06-16T13:30:00')
		)

		expect(shouldShowNextEvent(current, next, now)).toBe(false)
		expect(
			shouldShowNextEvent(current, next, new Date('2026-06-16T10:30:00'))
		).toBe(true)
		expect(
			shouldShowNextEvent(current, next, new Date('2026-06-16T10:00:00'))
		).toBe(true)
	})
})
