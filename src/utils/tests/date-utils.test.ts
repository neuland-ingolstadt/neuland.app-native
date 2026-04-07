import { beforeAll, describe, expect, it, mock } from 'bun:test'

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

mock.module('i18next', () => ({
	t: (key: string) => key
}))

let dateUtils: typeof import('../date-utils')

beforeAll(async () => {
	dateUtils = await import('../date-utils')
})

describe('date-utils', () => {
	it('formatISODate - Should format a real calendar date as ISO', () => {
		expect(dateUtils.formatISODate(new Date('2026-04-07T12:34:56'))).toBe(
			'2026-04-07'
		)
	})

	it('formatISODate - Should return an empty string for undefined dates', () => {
		expect(dateUtils.formatISODate(undefined)).toBe('')
	})

	it('formatISOTime - Should format hours and minutes as ISO time', () => {
		expect(dateUtils.formatISOTime(new Date('2026-04-07T08:05:00'))).toBe(
			'08:05'
		)
	})

	it('formatISOTime - Should return an empty string for undefined dates', () => {
		expect(dateUtils.formatISOTime(undefined)).toBe('')
	})

	it('getMonday - Should return the Monday of the same week', () => {
		expect(
			dateUtils.formatISODate(
				dateUtils.getMonday(new Date('2026-04-09T10:00:00'))
			)
		).toBe('2026-04-06')
	})

	it('getWeek - Should return the full week range starting on Monday', () => {
		const [start, end] = dateUtils.getWeek(new Date('2026-04-09T10:00:00'))
		expect(dateUtils.formatISODate(start)).toBe('2026-04-06')
		expect(dateUtils.formatISODate(end)).toBe('2026-04-13')
	})

	it('addWeek - Should move a date forward by one week', () => {
		const result = dateUtils.addWeek(new Date('2026-04-07T12:00:00'), 1)
		expect(dateUtils.formatISODate(result)).toBe('2026-04-14')
		expect(dateUtils.formatISOTime(result)).toBe('12:00')
	})

	it('isWeekend - Should detect Saturday and Sunday as weekend days', () => {
		expect(dateUtils.isWeekend(new Date('2026-04-11T12:00:00'))).toBe(true)
		expect(dateUtils.isWeekend(new Date('2026-04-12T12:00:00'))).toBe(true)
	})

	it('isWeekend - Should detect weekdays as non-weekend days', () => {
		expect(dateUtils.isWeekend(new Date('2026-04-09T12:00:00'))).toBe(false)
	})

	it('getAdjustedDay - Should move weekend dates to the next Monday', () => {
		expect(
			dateUtils.formatISODate(
				dateUtils.getAdjustedDay(new Date('2026-04-11T12:00:00'))
			)
		).toBe('2026-04-13')
	})

	it('getAdjustedDay - Should keep weekday dates unchanged', () => {
		const result = dateUtils.getAdjustedDay(new Date('2026-04-09T12:00:00'))
		expect(dateUtils.formatISODate(result)).toBe('2026-04-09')
		expect(dateUtils.formatISOTime(result)).toBe('12:00')
	})

	it('isSameDay - Should return true for dates on the same calendar day', () => {
		expect(
			dateUtils.isSameDay(
				new Date('2026-04-07T08:00:00'),
				new Date('2026-04-07T22:15:00')
			)
		).toBe(true)
	})

	it('isSameDay - Should return false for dates on different days', () => {
		expect(
			dateUtils.isSameDay(
				new Date('2026-04-07T08:00:00'),
				new Date('2026-04-08T08:00:00')
			)
		).toBe(false)
	})

	it('combineDateTime - Should combine the date and time components', () => {
		const result = dateUtils.combineDateTime(
			new Date('2026-04-07T00:00:00'),
			new Date('2026-04-07T13:45:30')
		)
		expect(dateUtils.formatISODate(result)).toBe('2026-04-07')
		expect(dateUtils.formatISOTime(result)).toBe('13:45')
	})

	it('getDateRange - Should create a consecutive range of dates', () => {
		expect(
			dateUtils
				.getDateRange(new Date('2026-04-07T00:00:00'), 3)
				.map((date) => dateUtils.formatISODate(date))
		).toEqual(['2026-04-07', '2026-04-08', '2026-04-09'])
	})

	it('ignoreTime - Should remove the time portion from a date', () => {
		expect(
			dateUtils.formatISODate(
				dateUtils.ignoreTime(new Date('2026-04-07T18:22:11'))
			)
		).toBe('2026-04-07')
		expect(
			dateUtils.formatISOTime(
				dateUtils.ignoreTime(new Date('2026-04-07T18:22:11'))
			)
		).toBe('00:00')
	})

	it('addDays - Should move a date forward by a number of days', () => {
		const result = dateUtils.addDays(new Date('2026-04-07T18:22:11'), 5)
		expect(dateUtils.formatISODate(result)).toBe('2026-04-12')
		expect(dateUtils.formatISOTime(result)).toBe('18:22')
	})

	it('convertTimeToDate - Should convert a valid time string to a date', () => {
		const result = dateUtils.convertTimeToDate(
			'13:45:30',
			new Date('2026-04-07T00:00:00')
		)
		expect(dateUtils.formatISODate(result as Date)).toBe('2026-04-07')
		expect(dateUtils.formatISOTime(result as Date)).toBe('13:45')
	})

	it('convertTimeToDate - Should return null for invalid or incomplete time strings', () => {
		expect(
			dateUtils.convertTimeToDate('13:45', new Date('2026-04-07T00:00:00'))
		).toBe(null)
		expect(
			dateUtils.convertTimeToDate('25:00:00', new Date('2026-04-07T00:00:00'))
		).toBe(null)
	})

	it('formatCompactDateRange - Should return one date for a single-day range', () => {
		expect(
			dateUtils.formatCompactDateRange(
				'2026-04-07T00:00:00',
				'2026-04-07T23:59:59'
			)
		).toBe('07.04')
	})

	it('formatCompactDateRange - Should return a date range for multiple days', () => {
		expect(
			dateUtils.formatCompactDateRange(
				'2026-04-07T00:00:00',
				'2026-04-09T00:00:00'
			)
		).toBe('07.04 - 09.04')
	})
})
