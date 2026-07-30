import { useQuery } from '@tanstack/react-query'
import type { Meal } from '@/types/neuland-api'
import { FOOD_DETAIL_RESTAURANTS, loadFoodEntries } from '@/utils/food-utils'

const MEALS_STALE_TIME_MS = 1000 * 60 * 5
const MEALS_GC_TIME_MS = 1000 * 60 * 60 * 24

export interface MealWithDate {
	meal: Meal | undefined
	date: string | undefined
}

export function useMealDetail(id: string): {
	queryData: Awaited<ReturnType<typeof loadFoodEntries>> | undefined
	isLoading: boolean
	error: Error | null
	meal: Meal | undefined
	date: string | undefined
} {
	const {
		data: queryData,
		isLoading,
		error
	} = useQuery({
		queryKey: ['meals', FOOD_DETAIL_RESTAURANTS, true],
		queryFn: () => loadFoodEntries([...FOOD_DETAIL_RESTAURANTS], true),
		staleTime: MEALS_STALE_TIME_MS,
		gcTime: MEALS_GC_TIME_MS
	})

	const mealWithDate = queryData?.reduce<MealWithDate>(
		(acc, day) => {
			const meal = day.meals.find((m) => m.id === id)
			if (meal) {
				return { meal, date: day.timestamp.toString() }
			}
			return acc
		},
		{ meal: undefined, date: undefined }
	)

	return {
		queryData,
		isLoading,
		error,
		meal: mealWithDate?.meal,
		date: mealWithDate?.date
	}
}
