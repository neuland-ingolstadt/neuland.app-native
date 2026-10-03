import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { Food, Meal } from '@/types/neuland-api'

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

mock.module('@aptabase/react-native', () => ({
	trackEvent: () => {}
}))

mock.module('expo-clipboard', () => ({
	setStringAsync: async () => {}
}))

mock.module('burnt', () => ({
	toast: () => {}
}))

mock.module('i18next', () => ({
	t: (key: string) => {
		if (key === 'dates.today') return 'Today'
		if (key === 'dates.tomorrow') return 'Tomorrow'
		return key
	},
	default: {
		language: 'en',
		t: (key: string) => key
	}
}))

mock.module(`${SRC_ROOT}__generated__/gql/graphql.ts`, () => ({
	FoodFieldsFragmentDoc: {},
	UniversitySportsFieldsFragmentDoc: {}
}))

mock.module(`${SRC_ROOT}__generated__/gql/index.ts`, () => ({
	getFragmentData: () => ({ foodData: [] })
}))

mock.module(`${SRC_ROOT}api/neuland-api.ts`, () => ({
	default: {
		getFoodPlan: async () => ({ food: [] })
	}
}))

let buildCanteenWidgetProps: typeof import('../canteen-widget-utils').buildCanteenWidgetProps

beforeAll(async () => {
	;({ buildCanteenWidgetProps } = await import('../canteen-widget-utils'))
})

function makeMeal({
	id = 'meal-1',
	restaurant,
	nameDe,
	prices = { student: 3.5, employee: 5.1, guest: 6.9 }
}: {
	id?: string
	restaurant: string
	nameDe: string
	prices?: Meal['prices']
}): Meal {
	return {
		id,
		category: 'main',
		name: { de: nameDe, en: nameDe },
		prices,
		allergens: null,
		flags: null,
		nutrition: null,
		variants: [],
		originalLanguage: 'de',
		static: false,
		restaurant
	}
}

describe('buildCanteenWidgetProps', () => {
	it('groups meals by restaurant and formats student prices', () => {
		const foodData: Food[] = [
			{
				timestamp: new Date(),
				meals: [
					makeMeal({
						restaurant: 'IngolstadtMensa',
						nameDe: 'Schnitzel',
						id: '1'
					}),
					makeMeal({
						restaurant: 'Reimanns',
						nameDe: 'Pizza',
						id: '2',
						prices: { student: 4.2, employee: 5.5, guest: 7 }
					})
				]
			}
		]

		const props = buildCanteenWidgetProps({
			foodData,
			foodLanguage: 'de',
			i18nLanguage: 'en',
			userKind: 'student',
			emptyLabel: 'empty',
			restaurantIds: ['IngolstadtMensa', 'Reimanns']
		})

		expect(props.emptyLabel).toBe('empty')
		expect(props.dateLabel).toBe('Today')
		expect(props.restaurants).toHaveLength(2)
		expect(props.restaurants[0]).toEqual({
			id: 'IngolstadtMensa',
			title: 'Mensa Ingolstadt',
			meals: [{ name: 'Schnitzel', price: '3.50 €' }]
		})
		expect(props.restaurants[1]).toEqual({
			id: 'Reimanns',
			title: 'Reimanns',
			meals: [{ name: 'Pizza', price: '4.20 €' }]
		})
	})

	it('falls back to the next available day when today has no entry', () => {
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)

		const props = buildCanteenWidgetProps({
			foodData: [
				{
					timestamp: tomorrow,
					meals: [
						makeMeal({
							restaurant: 'IngolstadtMensa',
							nameDe: 'Pasta'
						})
					]
				}
			],
			foodLanguage: 'en',
			i18nLanguage: 'en',
			userKind: 'guest',
			emptyLabel: 'empty',
			restaurantIds: ['IngolstadtMensa']
		})

		expect(props.dateLabel).toBe('Tomorrow')
		expect(props.restaurants[0].meals[0]).toEqual({
			name: 'Pasta',
			price: '6.90 €'
		})
	})
})
