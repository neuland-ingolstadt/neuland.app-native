import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { i18n } from 'i18next'
import type { Meal, Name } from '@/types/neuland-api'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const platform = { OS: 'web' as 'web' | 'ios' | 'android' }
const shareMock = mock(async () => {})
const copyToClipboardMock = mock(async () => {})
const trackEventMock = mock(() => {})
const mockGetFoodPlan = mock(
	async (): Promise<{ food: unknown }> => ({ food: [] })
)
const mockGetFragmentData = mock(() => ({ foodData: [] as unknown[] }))

mock.module(`${SRC_ROOT}localization/i18n.ts`, () => ({
	default: { language: 'de' }
}))

mock.module('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'de' }]
}))

mock.module('react-i18next', () => ({
	initReactI18next: {}
}))

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: platform,
		Share: { share: shareMock },
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
	Platform: platform,
	Share: { share: shareMock },
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

mock.module('@aptabase/react-native', () => ({
	trackEvent: trackEventMock
}))

mock.module('expo-clipboard', () => ({
	setStringAsync: async () => {}
}))

mock.module('burnt', () => ({
	toast: () => {}
}))

mock.module(`${SRC_ROOT}utils/ui-utils.ts`, () => ({
	copyToClipboard: copyToClipboardMock
}))

mock.module(`${SRC_ROOT}__generated__/gql/index.ts`, () => ({
	getFragmentData: mockGetFragmentData
}))

mock.module(`${SRC_ROOT}__generated__/gql/graphql.ts`, () => ({
	FoodFieldsFragmentDoc: {}
}))

mock.module(`${SRC_ROOT}api/neuland-api.ts`, () => ({
	default: {
		getFoodPlan: mockGetFoodPlan
	}
}))

let foodUtils: typeof import('../food-utils')

const formatYmd = (date: Date): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const weekdayIsoDates = (): string[] =>
	Array.from({ length: 7 }, (_, index) => {
		const date = new Date()
		date.setDate(date.getDate() + index)
		return date
	})
		.filter((date) => date.getDay() !== 0 && date.getDay() !== 6)
		.map(formatYmd)

const makeMeal = (id: string, isStatic: boolean): Meal =>
	({
		id,
		static: isStatic,
		name: { de: `Gericht ${id}`, en: `Meal ${id}` },
		category: 'Hauptgericht',
		prices: { guest: 4.5, employee: 3.5, student: 2.5 },
		allergens: null,
		flags: null,
		nutrition: null,
		variants: [],
		originalLanguage: 'de',
		restaurant: 'IngolstadtMensa'
	}) as Meal

beforeAll(async () => {
	foodUtils = await import('../food-utils')
})

describe('food-utils', () => {
	it('convertRelevantAllergens - Should convert selected allergens to a localized string', () => {
		const result = foodUtils.convertRelevantAllergens(
			['Wz', 'Ei', 'Mi'],
			['Ei', 'Mi'],
			'de'
		)
		expect(result).toBe('Eier • Milch/Laktose')
	})

	it('convertRelevantAllergens - Should return an empty string when no allergens match', () => {
		expect(foodUtils.convertRelevantAllergens(['Wz', 'Fi'], ['Ei'], 'en')).toBe(
			''
		)
	})

	it('convertRelevantFlags - Should convert matching flags to localized flag objects', () => {
		const result = foodUtils.convertRelevantFlags(
			['V', 'veg', 'B'],
			['B', 'V', 'veg'],
			'en'
		)
		expect(result).toEqual([
			{ name: 'Vegetarian', isVeg: true },
			{ name: 'Vegan', isVeg: true },
			{ name: 'Organic', isVeg: false }
		])
	})

	it('convertRelevantFlags - Should ignore flags that are not selected', () => {
		expect(foodUtils.convertRelevantFlags(['B'], ['veg'], 'de')).toEqual([])
	})

	it('formatPrice - Should format prices with euro and two decimal places', () => {
		expect(foodUtils.formatPrice(3.5)).toBe('3.50 €')
		expect(foodUtils.formatPrice(0)).toBe('0.00 €')
		expect(foodUtils.formatPrice(undefined)).toBe('')
	})

	it('getUserSpecificPrice - Should select the guest price', () => {
		const meal = {
			prices: {
				guest: 4.2,
				employee: 3.6,
				student: 2.8
			}
		}

		expect(foodUtils.getUserSpecificPrice(meal as never, 'guest')).toBe(
			'4.20 €'
		)
	})

	it('getUserSpecificPrice - Should select the employee price', () => {
		const meal = {
			prices: {
				guest: 4.2,
				employee: 3.6,
				student: 2.8
			}
		}

		expect(foodUtils.getUserSpecificPrice(meal as never, 'employee')).toBe(
			'3.60 €'
		)
	})

	it('getUserSpecificPrice - Should select the student price', () => {
		const meal = {
			prices: {
				guest: 4.2,
				employee: 3.6,
				student: 2.8
			}
		}

		expect(foodUtils.getUserSpecificPrice(meal as never, 'student')).toBe(
			'2.80 €'
		)
	})

	it('getUserSpecificLabel - Should select the guest label', () => {
		const t = ((key: string) => `translated:${key}`) as never

		expect(foodUtils.getUserSpecificLabel('guest', t)).toBe(
			'translated:price.guests'
		)
	})

	it('getUserSpecificLabel - Should select the employee label', () => {
		const t = ((key: string) => `translated:${key}`) as never

		expect(foodUtils.getUserSpecificLabel('employee', t)).toBe(
			'translated:price.employees'
		)
	})

	it('getUserSpecificLabel - Should select the student label', () => {
		const t = ((key: string) => `translated:${key}`) as never

		expect(foodUtils.getUserSpecificLabel('student', t)).toBe(
			'translated:price.students'
		)
	})

	it('mealName - Should select the German name when food language is de', () => {
		const name: Name = {
			de: 'Kartoffelsuppe',
			en: 'Potato soup'
		}

		expect(foodUtils.mealName(name, 'de', 'en')).toBe('Kartoffelsuppe')
	})

	it('mealName - Should select the English name when food language is en', () => {
		const name: Name = {
			de: 'Kartoffelsuppe',
			en: 'Potato soup'
		}

		expect(foodUtils.mealName(name, 'en', 'de')).toBe('Potato soup')
	})

	it('mealName - Should fall back to the current app language in default mode', () => {
		const name: Name = {
			de: 'Kartoffelsuppe',
			en: 'Potato soup'
		}

		expect(foodUtils.mealName(name, 'default', 'de')).toBe('Kartoffelsuppe')
		expect(foodUtils.mealName(name, 'default', 'en')).toBe('Potato soup')
	})

	it('userMealRating - Should block meals with matching allergens', () => {
		const meal = {
			allergens: ['Ei', 'Mi'],
			flags: ['V']
		}

		expect(foodUtils.userMealRating(meal as never, ['Mi'], ['V'])).toBe(-1)
	})

	it('userMealRating - Should reward meals that match preferences', () => {
		const meal = {
			allergens: ['Ei', 'Mi'],
			flags: ['V']
		}

		expect(foodUtils.userMealRating(meal as never, [], ['V'])).toBe(2)
	})

	it('userMealRating - Should return neutral for meals without allergens or matches', () => {
		const meal = {
			allergens: ['Ei', 'Mi'],
			flags: ['B']
		}

		expect(foodUtils.userMealRating(meal as never, [], [])).toBe(1)
	})

	it('userMealRating - Should handle missing allergens and flags as neutral', () => {
		const meal = {
			allergens: null,
			flags: null
		}
		expect(foodUtils.userMealRating(meal as never, ['Ei'], ['V'])).toBe(0)
	})

	it('loadFoodEntries - Should map weekday meal plans and exclude static meals by default', async () => {
		const isoDates = weekdayIsoDates()
		const targetDay = isoDates[0] as string

		mockGetFoodPlan.mockReset()
		mockGetFragmentData.mockReset()
		mockGetFoodPlan.mockResolvedValue({ food: 'graphql-payload' })
		mockGetFragmentData.mockReturnValue({
			foodData: [
				{
					timestamp: targetDay,
					meals: [makeMeal('static', true), makeMeal('daily', false)]
				}
			]
		})

		const result = await foodUtils.loadFoodEntries(['IngolstadtMensa'])

		expect(mockGetFoodPlan).toHaveBeenCalledWith(['IngolstadtMensa'])
		expect(result).toHaveLength(isoDates.length)
		expect(result.map((entry) => entry.timestamp)).toEqual(isoDates)
		expect(
			result.find((entry) => entry.timestamp === targetDay)?.meals
		).toEqual([makeMeal('daily', false)])
	})

	it('loadFoodEntries - Should keep static meals when includeStatic is true', async () => {
		const targetDay = weekdayIsoDates()[0] as string

		mockGetFoodPlan.mockReset()
		mockGetFragmentData.mockReset()
		mockGetFoodPlan.mockResolvedValue({ food: 'graphql-payload' })
		mockGetFragmentData.mockReturnValue({
			foodData: [
				{
					timestamp: targetDay,
					meals: [makeMeal('static', true), makeMeal('daily', false)]
				}
			]
		})

		const result = await foodUtils.loadFoodEntries(['IngolstadtMensa'], true)

		expect(
			result.find((entry) => entry.timestamp === targetDay)?.meals
		).toEqual([makeMeal('static', true), makeMeal('daily', false)])
	})

	it('shareMeal - Should track analytics and copy the message on web', () => {
		platform.OS = 'web'
		trackEventMock.mockReset()
		copyToClipboardMock.mockReset()
		shareMock.mockReset()

		const meal = makeMeal('share-meal', false)
		const i18nMock = {
			language: 'de',
			t: (
				key: string,
				options?: {
					ns?: string
					meal?: string
					price?: string
					location?: string
					id?: string
				}
			) =>
				key === 'details.share.message'
					? `share:${options?.meal}:${options?.price}:${options?.location}:${options?.id}`
					: key
		} as i18n

		foodUtils.shareMeal(meal, i18nMock, 'student')

		expect(trackEventMock).toHaveBeenCalledWith('Share', { type: 'meal' })
		expect(copyToClipboardMock).toHaveBeenCalledWith(
			'share:Gericht share-meal:2.50 €:Mensa Ingolstadt:share-meal'
		)
		expect(shareMock).not.toHaveBeenCalled()
	})

	it('shareMeal - Should open the native share sheet off web', () => {
		platform.OS = 'ios'
		trackEventMock.mockReset()
		copyToClipboardMock.mockReset()
		shareMock.mockReset()

		const meal = makeMeal('native-meal', false)
		const i18nMock = {
			language: 'de',
			t: (
				key: string,
				options?: {
					ns?: string
					meal?: string
					price?: string
					location?: string
					id?: string
				}
			) =>
				key === 'details.share.message'
					? `native:${options?.meal}:${options?.id}`
					: key
		} as i18n

		foodUtils.shareMeal(meal, i18nMock, 'guest')

		expect(shareMock).toHaveBeenCalledWith({
			message: 'native:Gericht native-meal:native-meal'
		})
		expect(copyToClipboardMock).not.toHaveBeenCalled()

		platform.OS = 'web'
	})
})
