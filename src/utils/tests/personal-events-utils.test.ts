import { describe, expect, it } from 'bun:test'
import dayjs from '@/lib/dayjs'
import type { PersonalEvent } from '@/types/personal-events'
import {
	createPersonalEventId,
	expandPersonalEvents,
	getUpcomingPersonalOccurrences,
	personalOccurrencesToWeekEvents,
	validatePersonalEvent
} from '@/utils/personal-events-utils'

process.env.TZ = 'Europe/Berlin'

function event(patch: Partial<PersonalEvent> = {}): PersonalEvent {
	return {
		id: 'series',
		title: 'Study group',
		location: 'G101',
		start: '2026-01-31T10:00:00',
		end: '2026-01-31T11:00:00',
		recurrence: 'none',
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
		...patch
	}
}
const date = (value: string) => new Date(value)
const expand = (
	entry: PersonalEvent,
	from = '2026-01-01',
	to = '2026-12-31T23:59:59'
) => expandPersonalEvents([entry], date(from), date(to))
const days = (entries: ReturnType<typeof expand>) =>
	entries.map((entry) => dayjs(entry.startDate).format('YYYY-MM-DD HH:mm'))

describe('personal events expansion', () => {
	it('includes one-off events, preserving identity and metadata', () => {
		const occurrence = expand(event())[0]
		expect(occurrence).toEqual({
			eventType: 'personal',
			id: `series_${date('2026-01-31T10:00:00').getTime()}`,
			seriesId: 'series',
			name: 'Study group',
			location: 'G101',
			date: date('2026-01-31T00:00:00'),
			startDate: date('2026-01-31T10:00:00'),
			endDate: date('2026-01-31T11:00:00'),
			recurrence: 'none'
		})
	})
	it('excludes one-off events outside the window and completed events at the lower edge', () => {
		expect(expand(event(), '2026-02-01')).toEqual([])
		expect(expand(event(), '2026-01-01', '2026-01-30')).toEqual([])
		expect(expand(event(), '2026-01-31T11:00:00')).toEqual([])
	})
	it('clips by intersection, including running events and starts at the upper edge', () => {
		expect(
			expand(event(), '2026-01-31T10:30:00', '2026-01-31T10:45:00')
		).toHaveLength(1)
		expect(
			expand(event(), '2026-01-31T09:00:00', '2026-01-31T10:00:00')
		).toHaveLength(1)
	})
	it('expands daily through the inclusive until date', () => {
		expect(
			days(
				expand(event({ recurrence: 'daily', recurrenceUntil: '2026-02-02' }))
			)
		).toEqual(['2026-01-31 10:00', '2026-02-01 10:00', '2026-02-02 10:00'])
	})
	it('expands weekly and clips both window edges', () => {
		const entry = event({ recurrence: 'weekly', recurrenceUntil: '2026-02-21' })
		expect(days(expand(entry))).toEqual([
			'2026-01-31 10:00',
			'2026-02-07 10:00',
			'2026-02-14 10:00',
			'2026-02-21 10:00'
		])
		expect(days(expand(entry, '2026-02-07T10:30:00', '2026-02-20'))).toEqual([
			'2026-02-07 10:00',
			'2026-02-14 10:00'
		])
	})
	it('clamps February but returns to the 31st in March', () => {
		expect(
			days(
				expand(event({ recurrence: 'monthly', recurrenceUntil: '2026-04-30' }))
			)
		).toEqual([
			'2026-01-31 10:00',
			'2026-02-28 10:00',
			'2026-03-31 10:00',
			'2026-04-30 10:00'
		])
	})
	it('clamps leap-year February to the 29th', () => {
		expect(
			days(
				expand(
					event({
						start: '2028-01-31T10:00:00',
						end: '2028-01-31T11:00:00',
						recurrence: 'monthly',
						recurrenceUntil: '2028-03-31'
					}),
					'2028-02-01',
					'2028-03-31T23:59:59'
				)
			)
		).toEqual(['2028-02-29 10:00', '2028-03-31 10:00'])
	})
	for (const [start, end, until, dates] of [
		[
			'2026-03-22T10:00:00',
			'2026-03-22T11:00:00',
			'2026-04-05',
			['2026-03-22 10:00', '2026-03-29 10:00', '2026-04-05 10:00']
		],
		[
			'2026-10-18T10:00:00',
			'2026-10-18T11:00:00',
			'2026-11-01',
			['2026-10-18 10:00', '2026-10-25 10:00', '2026-11-01 10:00']
		]
	] as const) {
		it(`keeps weekly wall time across DST from ${start}`, () => {
			const occurrences = expand(
				event({ start, end, recurrence: 'weekly', recurrenceUntil: until })
			)
			expect(days(occurrences)).toEqual([...dates])
			expect(occurrences.map((entry) => entry.endDate.getHours())).toEqual([
				11, 11, 11
			])
			expect(occurrences[0].startDate.getTimezoneOffset()).not.toBe(
				occurrences[1].startDate.getTimezoneOffset()
			)
		})
	}
	it('keeps daily wall time across DST with ISO timestamps', () => {
		const occurrences = expand(
			event({
				start: '2026-03-28T09:00:00Z',
				end: '2026-03-28T10:00:00Z',
				recurrence: 'daily',
				recurrenceUntil: '2026-03-30'
			})
		)
		expect(days(occurrences)).toEqual([
			'2026-03-28 10:00',
			'2026-03-29 10:00',
			'2026-03-30 10:00'
		])
	})
	it('caps expansion at 1000 attempts per series', () => {
		expect(
			expand(
				event({ recurrence: 'daily', recurrenceUntil: '2040-01-31' }),
				'2026-01-01',
				'2041-01-01'
			)
		).toHaveLength(1000)
	})
	it('jumps near the window for old series', () => {
		expect(
			days(
				expand(
					event({
						start: '2000-01-01T10:00:00',
						end: '2000-01-01T11:00:00',
						recurrence: 'daily',
						recurrenceUntil: '2030-12-31'
					}),
					'2026-04-01',
					'2026-04-02T23:59:59'
				)
			)
		).toEqual(['2026-04-01 10:00', '2026-04-02 10:00'])
	})
	it('sorts events across series', () => {
		expect(
			expandPersonalEvents(
				[
					event({ id: 'late' }),
					event({
						id: 'early',
						start: '2026-01-30T10:00:00',
						end: '2026-01-30T11:00:00'
					})
				],
				date('2026-01-01'),
				date('2026-02-01')
			).map((entry) => entry.seriesId)
		).toEqual(['early', 'late'])
	})
	it('handles invalid ranges and stored dates', () => {
		expect(expand(event(), 'invalid')).toEqual([])
		expect(expand(event(), '2027-01-01', '2026-01-01')).toEqual([])
		expect(expand(event({ start: 'invalid' }))).toEqual([])
		expect(expand(event({ end: 'invalid' }))).toEqual([])
		expect(expand(event({ end: '2026-02-01T11:00:00' }))).toEqual([])
		expect(
			expand(event({ recurrence: 'daily', recurrenceUntil: 'invalid' }))
		).toEqual([])
	})
})

describe('personal event validation', () => {
	it('accepts valid optional fields and inclusive two-year boundary', () => {
		expect(validatePersonalEvent(event({ location: undefined }))).toEqual([])
		expect(
			validatePersonalEvent(
				event({
					title: 'x'.repeat(80),
					location: 'x'.repeat(80),
					recurrence: 'daily',
					recurrenceUntil: '2028-01-31'
				})
			)
		).toEqual([])
		expect(
			validatePersonalEvent(
				event({ recurrence: 'weekly', recurrenceUntil: '2026-01-31' })
			)
		).toEqual([])
	})
	for (const [patch, error] of [
		[{ title: '   ' }, 'titleRequired'],
		[{ title: 'x'.repeat(81) }, 'titleTooLong'],
		[{ location: 'x'.repeat(81) }, 'locationTooLong'],
		[{ start: 'invalid' }, 'invalidTime'],
		[{ end: 'invalid' }, 'invalidTime'],
		[{ end: '2026-01-31T10:00:00' }, 'invalidTime'],
		[{ end: '2026-01-31T09:00:00' }, 'invalidTime'],
		[{ end: '2026-02-01T11:00:00' }, 'singleDay'],
		[{ recurrence: 'daily', recurrenceUntil: undefined }, 'untilRequired'],
		[{ recurrence: 'daily', recurrenceUntil: 'invalid' }, 'untilRequired'],
		[
			{ recurrence: 'daily', recurrenceUntil: '2026-01-30' },
			'untilBeforeStart'
		],
		[{ recurrence: 'daily', recurrenceUntil: '2028-02-01' }, 'untilTooLate']
	] as const) {
		it(`rejects ${JSON.stringify(patch)}`, () =>
			expect(validatePersonalEvent(event(patch))).toContain(error))
	}
	it('does not require an until date for one-off events', () => {
		expect(
			validatePersonalEvent(event({ recurrenceUntil: 'invalid' }))
		).toEqual([])
	})
})

describe('upcoming personal events', () => {
	it('maps expanded series without passing a recurrence rule to CalendarKit', () => {
		const occurrences = expand(
			event({ recurrence: 'weekly', recurrenceUntil: '2026-02-07' })
		)
		const calendarEvents = personalOccurrencesToWeekEvents(occurrences)
		expect(calendarEvents).toHaveLength(2)
		expect(calendarEvents[0]).not.toHaveProperty('recurrence')
		expect(calendarEvents[0].seriesId).toBe('series')
		expect(calendarEvents[0].start.dateTime).toEqual(occurrences[0].startDate)
		expect(calendarEvents[1].end.dateTime).toEqual(occurrences[1].endDate)
		expect(calendarEvents[0].id).not.toBe(calendarEvents[1].id)
	})
	it('includes running events, orders and limits results', () => {
		const events = [
			event({
				id: 'later',
				start: '2026-02-01T10:00:00',
				end: '2026-02-01T11:00:00'
			}),
			event(),
			event({
				id: 'finished',
				start: '2026-01-31T08:00:00',
				end: '2026-01-31T09:00:00'
			})
		]
		const now = date('2026-01-31T10:30:00')
		expect(
			getUpcomingPersonalOccurrences(events, now, 3).map(
				(entry) => entry.seriesId
			)
		).toEqual(['series', 'later'])
		expect(getUpcomingPersonalOccurrences(events, now, 1)).toHaveLength(1)
		expect(getUpcomingPersonalOccurrences(events, now, 0)).toEqual([])
		expect(getUpcomingPersonalOccurrences(events, now, -1)).toEqual([])
	})
	it('includes a distant one-off event', () => {
		expect(
			getUpcomingPersonalOccurrences(
				[event({ start: '2030-01-31T10:00:00', end: '2030-01-31T11:00:00' })],
				date('2026-01-01'),
				3
			)
		).toHaveLength(1)
	})
	it('returns no results when events are past or absent', () => {
		expect(
			getUpcomingPersonalOccurrences([event()], date('2027-01-01'), 3)
		).toEqual([])
		expect(getUpcomingPersonalOccurrences([], date('2026-01-01'), 3)).toEqual(
			[]
		)
	})
	it('generates distinct nonempty ids', () => {
		const ids = Array.from({ length: 100 }, createPersonalEventId)
		expect(new Set(ids).size).toBe(100)
		expect(ids.every((id) => /^[a-z0-9]+_[a-z0-9]+$/.test(id))).toBe(true)
	})
})
