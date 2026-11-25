import { describe, expect, it } from 'bun:test'
import {
	mapApiMeal,
	mapMealDaysToFood,
	toApiRestaurant,
	toUiCategory,
	toUiRestaurant
} from '../food-meal-mapping'

describe('food-meal-mapping', () => {
	it('maps UI restaurants to API enums and back', () => {
		expect(toApiRestaurant('IngolstadtMensa')).toBe('INGOLSTADT_MENSA')
		expect(toApiRestaurant('NeuburgMensa')).toBe('NEUBURG_MENSA')
		expect(toApiRestaurant('Reimanns')).toBe('REIMANNS')
		expect(toApiRestaurant('Canisius')).toBe('CANISIUS')
		expect(toApiRestaurant('Unknown')).toBeUndefined()

		expect(toUiRestaurant('INGOLSTADT_MENSA')).toBe('IngolstadtMensa')
		expect(toUiRestaurant('NEUBURG_MENSA')).toBe('NeuburgMensa')
		expect(toUiRestaurant('REIMANNS')).toBe('Reimanns')
		expect(toUiRestaurant('CANISIUS')).toBe('Canisius')
		expect(toUiRestaurant('UNKNOWN' as never)).toBeUndefined()
	})

	it('maps API categories to UI i18n keys', () => {
		expect(toUiCategory('MAIN')).toBe('main')
		expect(toUiCategory('SOUP')).toBe('soup')
		expect(toUiCategory('SALAD')).toBe('salad')
		expect(toUiCategory('OTHER')).toBe('special')
	})

	it('maps API meals onto UI Meal shape', () => {
		const meal = mapApiMeal({
			id: 'meal-1',
			name: { de: 'Suppe', en: 'Soup' },
			category: 'SOUP',
			price: { student: 1.5, employee: 2.5, guest: 3.5 },
			originalLanguage: 'de',
			static: false,
			restaurant: 'INGOLSTADT_MENSA',
			variations: [
				{
					id: 'var-1',
					name: { de: 'Brot', en: 'Bread' },
					additional: true,
					price: { student: 0.5, employee: 0.5, guest: 0.5 },
					originalLanguage: 'de',
					static: true,
					restaurant: 'INGOLSTADT_MENSA'
				}
			]
		})

		expect(meal).toEqual({
			id: 'meal-1',
			name: { de: 'Suppe', en: 'Soup' },
			category: 'soup',
			prices: { student: 1.5, employee: 2.5, guest: 3.5 },
			allergens: null,
			flags: null,
			nutrition: null,
			variants: [
				{
					id: 'var-1',
					name: { de: 'Brot', en: 'Bread' },
					additional: true,
					prices: { student: 0.5, employee: 0.5, guest: 0.5 }
				}
			],
			originalLanguage: 'de',
			static: false,
			restaurant: 'IngolstadtMensa'
		})
	})

	it('maps MealDay date to Food timestamp', () => {
		expect(
			mapMealDaysToFood([
				{
					date: '2026-11-23',
					meals: [
						{
							id: 'm1',
							name: { de: 'A', en: 'A' },
							category: 'MAIN',
							price: { student: 1, employee: 2, guest: 3 },
							originalLanguage: 'de',
							static: false,
							restaurant: 'REIMANNS'
						}
					]
				}
			])
		).toEqual([
			{
				timestamp: '2026-11-23',
				meals: [
					{
						id: 'm1',
						name: { de: 'A', en: 'A' },
						category: 'main',
						prices: { student: 1, employee: 2, guest: 3 },
						allergens: null,
						flags: null,
						nutrition: null,
						variants: [],
						originalLanguage: 'de',
						static: false,
						restaurant: 'Reimanns'
					}
				]
			}
		])
	})
})
