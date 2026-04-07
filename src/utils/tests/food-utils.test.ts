import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { Name } from '@/types/neuland-api'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

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
		Platform: { OS: 'web' },
		Share: { share: () => Promise.resolve() },
		TurboModuleRegistry: {
			get: () => null,
			getEnforcing: () => null
		}
	},
	Platform: { OS: 'web' },
	Share: { share: () => Promise.resolve() },
	TurboModuleRegistry: {
		get: () => null,
		getEnforcing: () => null
	}
}))

mock.module('@aptabase/react-native', () => ({
	trackEvent: () => {}
}))

mock.module(`${SRC_ROOT}utils/ui-utils.ts`, () => ({
	copyToClipboard: () => Promise.resolve()
}))

mock.module(`${SRC_ROOT}__generated__/gql/index.ts`, () => ({
	getFragmentData: () => ({ foodData: [] })
}))

mock.module(`${SRC_ROOT}__generated__/gql/graphql.ts`, () => ({
	FoodFieldsFragmentDoc: {}
}))

mock.module(`${SRC_ROOT}api/neuland-api.ts`, () => ({
	default: {
		getFoodPlan: async () => ({
			food: []
		})
	}
}))

let foodUtils: typeof import('../food-utils')

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
})
