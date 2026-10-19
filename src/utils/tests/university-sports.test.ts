import { describe, expect, it } from 'bun:test'
import type { Sports } from '@/types/university-sports'
import {
	hasSportsDescription,
	sportsLocalizedDescription,
	sportsLocalizedTitle,
	weekdaySortIndex
} from '@/types/university-sports'

const sport = (overrides?: {
	deTitle?: string
	enTitle?: string
	deDescription?: string | null
	enDescription?: string | null
}): Sports => ({
	id: 1,
	weekday: 'MONDAY',
	campus: 'INGOLSTADT',
	location: 'Gym',
	startTime: '18:00:00Z',
	endTime: null,
	requiresRegistration: false,
	invitationLink: null,
	email: null,
	sportsCategory: 'OTHER',
	contents: {
		de: {
			title: overrides?.deTitle ?? 'Basketball DE',
			description:
				overrides?.deDescription === undefined
					? 'Beschreibung'
					: overrides.deDescription
		},
		en: {
			title: overrides?.enTitle ?? 'Basketball EN',
			description:
				overrides?.enDescription === undefined
					? 'Description'
					: overrides.enDescription
		}
	}
})

describe('university-sports', () => {
	it('weekdaySortIndex - Should return calendar order indexes', () => {
		expect(weekdaySortIndex('MONDAY')).toBe(0)
		expect(weekdaySortIndex('WEDNESDAY')).toBe(2)
		expect(weekdaySortIndex('SUNDAY')).toBe(6)
	})

	it('sportsLocalizedTitle - Should prefer the requested language and fall back to English', () => {
		expect(sportsLocalizedTitle(sport(), 'de')).toBe('Basketball DE')
		expect(sportsLocalizedTitle(sport(), 'en')).toBe('Basketball EN')
		expect(
			sportsLocalizedTitle(
				{
					...sport(),
					contents: {
						en: { title: 'Basketball EN', description: null }
					} as Sports['contents']
				},
				'de'
			)
		).toBe('Basketball EN')
	})

	it('sportsLocalizedDescription - Should prefer language, then English, then empty string', () => {
		expect(sportsLocalizedDescription(sport(), 'de')).toBe('Beschreibung')
		expect(
			sportsLocalizedDescription(sport({ deDescription: null }), 'de')
		).toBe('Description')
		expect(
			sportsLocalizedDescription(
				sport({ deDescription: null, enDescription: null }),
				'de'
			)
		).toBe('')
	})

	it('hasSportsDescription - Should detect non-empty descriptions in either language', () => {
		expect(hasSportsDescription(sport())).toBe(true)
		expect(
			hasSportsDescription(sport({ deDescription: null, enDescription: null }))
		).toBe(false)
		expect(
			hasSportsDescription(sport({ deDescription: '', enDescription: 'Hi' }))
		).toBe(true)
		expect(
			hasSportsDescription(sport({ deDescription: 'Hi', enDescription: null }))
		).toBe(true)
	})
})
