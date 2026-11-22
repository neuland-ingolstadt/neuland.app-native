import type { components } from '@neuland-ingolstadt/backend-food-api'
import type { Food, Meal, Variation } from '@/types/neuland-api'

export type MealDay = components['schemas']['MealDay']
export type ApiMeal = components['schemas']['Meal']
export type ApiMealVariation = components['schemas']['MealVariation']
export type MealCategory = components['schemas']['MealCategory']
export type Restaurant = components['schemas']['Restaurant']

/** App UI restaurant ids (PascalCase) → Food API enum values. */
const UI_TO_API_RESTAURANT: Record<string, Restaurant> = {
	IngolstadtMensa: 'INGOLSTADT_MENSA',
	NeuburgMensa: 'NEUBURG_MENSA',
	Reimanns: 'REIMANNS',
	Canisius: 'CANISIUS'
}

/** Food API enum values → app UI restaurant ids. */
const API_TO_UI_RESTAURANT: Record<Restaurant, string> = {
	INGOLSTADT_MENSA: 'IngolstadtMensa',
	NEUBURG_MENSA: 'NeuburgMensa',
	REIMANNS: 'Reimanns',
	CANISIUS: 'Canisius'
}

/** Food API MealCategory → lowercase keys used by food i18n / grouping. */
const API_TO_UI_CATEGORY: Record<MealCategory, string> = {
	MAIN: 'main',
	SOUP: 'soup',
	SALAD: 'salad',
	OTHER: 'special'
}

export function toApiRestaurant(restaurant: string): Restaurant | undefined {
	return UI_TO_API_RESTAURANT[restaurant]
}

export function toUiRestaurant(restaurant: Restaurant): string {
	return API_TO_UI_RESTAURANT[restaurant]
}

export function toUiCategory(category: MealCategory): string {
	return API_TO_UI_CATEGORY[category]
}

function mapVariation(variation: ApiMealVariation): Variation {
	return {
		id: variation.id,
		name: variation.name,
		additional: variation.additional,
		prices: variation.price
	}
}

export function mapApiMeal(meal: ApiMeal): Meal {
	return {
		id: meal.id,
		name: meal.name,
		category: toUiCategory(meal.category),
		prices: meal.price,
		allergens: meal.allergens ?? null,
		flags: meal.flags ?? null,
		nutrition: meal.nutrition ?? null,
		variants: (meal.variations ?? []).map(mapVariation),
		originalLanguage: meal.originalLanguage,
		static: meal.static,
		restaurant: toUiRestaurant(meal.restaurant)
	}
}

export function mapMealDaysToFood(mealDays: MealDay[]): Food[] {
	return mealDays.map((day) => ({
		timestamp: day.date,
		meals: day.meals.map(mapApiMeal)
	}))
}
