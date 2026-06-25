import { describe, expect, it } from 'bun:test'
import type { FriendlyTimetableEntry } from '@/types/utils'
import {
	getEventStatus,
	getTodayEvents,
	getTodayStats,
	getUpNextCardData,
	shouldShowNextEvent
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
	})
})
