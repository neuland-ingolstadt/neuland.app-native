import { beforeAll, describe, expect, it, mock, spyOn } from 'bun:test'

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

	describe('friendly formatters', () => {
		const FIXED_NOW = Date.parse('2026-04-07T12:00:00')

		const withFrozenNow = (run: () => void): void => {
			const nowSpy = spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
			try {
				run()
			} finally {
				nowSpy.mockRestore()
			}
		}

		const fixedDate = (isoDate: string, hours = 8, minutes = 0): Date =>
			new Date(
				`${isoDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
			)

		const todayAt = (hours = 8, minutes = 0): Date => {
			const now = new Date()
			return new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				hours,
				minutes
			)
		}

		const tomorrowAt = (hours = 8, minutes = 0): Date => {
			const date = todayAt(hours, minutes)
			date.setDate(date.getDate() + 1)
			return date
		}

		it('formatFriendlyDate - Should return the today label for the current day', () => {
			expect(dateUtils.formatFriendlyDate(todayAt())).toBe('dates.today')
		})

		it('formatFriendlyDate - Should return the tomorrow label for the next day', () => {
			expect(dateUtils.formatFriendlyDate(tomorrowAt())).toBe('dates.tomorrow')
		})

		it('formatFriendlyDate - Should format other days with weekday and German date', () => {
			expect(dateUtils.formatFriendlyDate(fixedDate('2026-04-09'))).toBe(
				'Do., 09.04.2026'
			)
		})

		it('formatFriendlyDate - Should skip relative labels when relative is false', () => {
			expect(
				dateUtils.formatFriendlyDate(todayAt(), {
					relative: false,
					weekday: 'short'
				})
			).toMatch(/, \d{2}\.\d{2}\.\d{4}$/)
		})

		it('formatFriendlyDate - Should support long weekday names', () => {
			expect(
				dateUtils.formatFriendlyDate(fixedDate('2026-04-09'), {
					relative: false,
					weekday: 'long'
				})
			).toBe('Donnerstag, 09.04.2026')
		})

		it('formatFriendlyDateRange - Should return only the begin date for same-day ranges', () => {
			expect(
				dateUtils.formatFriendlyDateRange(
					fixedDate('2026-04-09'),
					fixedDate('2026-04-09', 20)
				)
			).toBe('Do., 09.04.2026')
		})

		it('formatFriendlyDateRange - Should join different days with a range separator', () => {
			expect(
				dateUtils.formatFriendlyDateRange(
					fixedDate('2026-04-09'),
					fixedDate('2026-04-10')
				)
			).toBe('Do., 09.04.2026 – Fr., 10.04.2026')
		})

		it('formatFriendlyTime - Should format valid datetimes as HH:mm', () => {
			expect(dateUtils.formatFriendlyTime(fixedDate('2026-04-07', 8, 15))).toBe(
				'08:15'
			)
		})

		it('formatFriendlyTime - Should return an empty string for missing or invalid input', () => {
			expect(dateUtils.formatFriendlyTime(undefined)).toBe('')
			expect(dateUtils.formatFriendlyTime('not-a-date')).toBe('')
		})

		it('formatFriendlyTimeString - Should trim seconds from a time string', () => {
			expect(dateUtils.formatFriendlyTimeString('08:30:45')).toBe('08:30')
		})

		it('formatFriendlyTimeRange - Should format a single time or a range', () => {
			expect(dateUtils.formatFriendlyTimeRange('08:00:00')).toBe('08:00')
			expect(dateUtils.formatFriendlyTimeRange('08:00:00', '12:30:00')).toBe(
				'08:00 – 12:30'
			)
		})

		it('formatFriendlyDateTimeRange - Should return an empty string without a begin date', () => {
			expect(dateUtils.formatFriendlyDateTimeRange(null, null)).toBe('')
		})

		it('formatFriendlyDateTimeRange - Should format same-day ranges with one date label', () => {
			expect(
				dateUtils.formatFriendlyDateTimeRange(
					fixedDate('2026-04-09', 8),
					fixedDate('2026-04-09', 12, 30)
				)
			).toBe('Do., 09.04.2026, 08:00 – 12:30')
		})

		it('formatFriendlyDateTimeRange - Should repeat the date when the range spans days', () => {
			expect(
				dateUtils.formatFriendlyDateTimeRange(
					fixedDate('2026-04-09', 8),
					fixedDate('2026-04-10', 12, 30)
				)
			).toBe('Do., 09.04.2026, 08:00 – Fr., 10.04.2026, 12:30')
		})

		it('formatFriendlyDateTime - Should handle missing, sentinel and valid dates', () => {
			expect(dateUtils.formatFriendlyDateTime(undefined)).toBe(
				'No date available'
			)
			expect(dateUtils.formatFriendlyDateTime('invalid')).toBe(
				'No date available'
			)
			expect(
				dateUtils.formatFriendlyDateTime(new Date('1970-01-01T00:00:00'))
			).toBe(null)
			expect(
				dateUtils.formatFriendlyDateTime(fixedDate('2026-04-09', 8, 15))
			).toBe('Do., 09.04.2026, 08:15')
		})

		it('formatNearDate - Should return today and tomorrow labels or a near date', () => {
			expect(dateUtils.formatNearDate(todayAt())).toBe('dates.today')
			expect(dateUtils.formatNearDate(tomorrowAt())).toBe('dates.tomorrow')
			expect(dateUtils.formatNearDate(fixedDate('2026-04-09'))).toBe(
				'Donnerstag, 9.4.'
			)
		})

		it('formatFriendlyRelativeTime - Should reject sentinel and invalid dates', () => {
			expect(
				dateUtils.formatFriendlyRelativeTime(new Date('1970-01-01T00:00:00'))
			).toBe('')
			expect(dateUtils.formatFriendlyRelativeTime(new Date(Number.NaN))).toBe(
				''
			)
		})

		it('formatFriendlyRelativeTime - Should return a relative label for future dates', () => {
			withFrozenNow(() => {
				const inFiveMinutes = new Date(FIXED_NOW + 5 * 60 * 1000)
				expect(dateUtils.formatFriendlyRelativeTime(inFiveMinutes)).toBe(
					'in 5 Minuten'
				)
			})
		})

		it('formatRelativeMinutes - Should count minutes until a future datetime', () => {
			withFrozenNow(() => {
				const inTenMinutes = new Date(FIXED_NOW + 10 * 60 * 1000)
				expect(dateUtils.formatRelativeMinutes(inTenMinutes)).toBe('10 min')
			})
		})

		it('formatRelativeMinutes - Should not return negative minute counts', () => {
			withFrozenNow(() => {
				const oneHourAgo = new Date(FIXED_NOW - 60 * 60 * 1000)
				expect(dateUtils.formatRelativeMinutes(oneHourAgo)).toBe('0 min')
			})
		})

		it('getFriendlyWeek - Should label the current and next week relatively', () => {
			const [currentWeekStart, currentWeekEnd] = dateUtils.getWeek(new Date())
			const inCurrentWeek = new Date(currentWeekStart)
			inCurrentWeek.setDate(inCurrentWeek.getDate() + 1)

			const inNextWeek = new Date(currentWeekEnd)
			inNextWeek.setDate(inNextWeek.getDate() + 1)

			expect(dateUtils.getFriendlyWeek(inCurrentWeek, 'de')).toBe(
				'dates.thisWeek'
			)
			expect(dateUtils.getFriendlyWeek(inNextWeek, 'de')).toBe('dates.nextWeek')
		})

		it('getFriendlyWeek - Should format arbitrary weeks as a numeric range', () => {
			expect(dateUtils.getFriendlyWeek(fixedDate('2025-01-15'), 'de')).toBe(
				'13.1. – 19.1.'
			)
		})

		it('formatDay - Should format weekday and day using the active locale', () => {
			expect(dateUtils.formatDay(fixedDate('2026-04-09'))).toBe('Do. 09.')
		})
	})
})
