import type { FoodLanguage } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'
import type {
	CanteenWidgetProps,
	CanteenWidgetRestaurant
} from '@/types/canteen-widget'
import type { Food, Meal } from '@/types/neuland-api'
import { formatFriendlyDate, formatISODate } from './date-utils'
import {
	FOOD_DETAIL_RESTAURANTS,
	getUserSpecificPrice,
	humanLocations,
	mealName
} from './food-utils'

const MAX_MEALS_PER_RESTAURANT = 8

export interface BuildCanteenWidgetPropsOptions {
	foodData: Food[]
	foodLanguage: FoodLanguage
	i18nLanguage: LanguageKey
	userKind: string
	emptyLabel: string
	restaurantIds?: readonly string[]
}

function pickWidgetDay(foodData: Food[]): Food | undefined {
	const todayIso = formatISODate(new Date())
	const todayStart = new Date().setHours(0, 0, 0, 0)
	const upcoming = foodData.filter(
		(day) => new Date(day.timestamp).getTime() >= todayStart
	)

	return (
		upcoming.find((day) => {
			const timestamp =
				typeof day.timestamp === 'string'
					? day.timestamp.slice(0, 10)
					: formatISODate(day.timestamp)
			return timestamp === todayIso
		}) ?? upcoming[0]
	)
}

function toWidgetMeals(
	meals: Meal[],
	foodLanguage: FoodLanguage,
	i18nLanguage: LanguageKey,
	userKind: string
): CanteenWidgetRestaurant['meals'] {
	return meals.slice(0, MAX_MEALS_PER_RESTAURANT).map((meal) => ({
		name: mealName(meal.name, foodLanguage, i18nLanguage),
		price: getUserSpecificPrice(meal, userKind)
	}))
}

/**
 * Builds snapshot props for the canteen home-screen widget from meal-plan data.
 */
export function buildCanteenWidgetProps({
	foodData,
	foodLanguage,
	i18nLanguage,
	userKind,
	emptyLabel,
	restaurantIds = FOOD_DETAIL_RESTAURANTS
}: BuildCanteenWidgetPropsOptions): CanteenWidgetProps {
	const day = pickWidgetDay(foodData)
	const dayMeals = day?.meals ?? []

	const restaurants: CanteenWidgetRestaurant[] = restaurantIds.map((id) => ({
		id,
		title: humanLocations[id as keyof typeof humanLocations] ?? id,
		meals: toWidgetMeals(
			dayMeals.filter((meal) => meal.restaurant === id),
			foodLanguage,
			i18nLanguage,
			userKind
		)
	}))

	return {
		dateLabel: day == null ? '' : formatFriendlyDate(day.timestamp),
		emptyLabel,
		restaurants
	}
}
