import { formatISODate } from '@/utils/date-utils'

const GRAPHQL_ENDPOINT =
	process.env.EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT ??
	'https://api.neuland.app/graphql'

export type MensaClipMeal = {
	name: string
	price: string
	category: string
	restaurant: string
}

type FoodPlanResponse = {
	data?: {
		food?: {
			foodData?: Array<{
				timestamp: string
				meals?: Array<{
					name?: { de?: string | null; en?: string | null }
					prices?: { student?: number | null }
					category?: string
					restaurant?: string
					static?: boolean
				} | null> | null
			} | null> | null
		} | null
	}
	errors?: unknown
}

const FOOD_QUERY = `
query FoodPlan($locations: [LocationInput!]!) {
  food(locations: $locations) {
    foodData {
      timestamp
      meals {
        name { de en }
        prices { student }
        category
        restaurant
        static
      }
    }
  }
}
`

function formatPrice(price?: number | null): string {
	return price != null ? `${price.toFixed(2)} €` : ''
}

/**
 * Lightweight GraphQL fetch for the Mensa App Clip (no auth / heavy clients).
 */
export async function fetchTodayMensaMeals(
	language: 'de' | 'en' = 'de'
): Promise<MensaClipMeal[]> {
	const response = await fetch(GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: FOOD_QUERY,
			variables: {
				locations: ['IngolstadtMensa', 'Reimanns']
			}
		})
	})

	const json = (await response.json()) as FoodPlanResponse
	if (!response.ok || json.errors != null) {
		throw new Error('Failed to load mensa menu')
	}

	const today = formatISODate(new Date())
	const days = json.data?.food?.foodData ?? []
	const todayEntry =
		days.find((day) => day?.timestamp?.slice(0, 10) === today) ?? days[0]

	const meals = (todayEntry?.meals ?? [])
		.filter((meal): meal is NonNullable<typeof meal> => meal != null)
		.filter((meal) => meal.static !== true)
		.map((meal) => ({
			name: meal.name?.[language] ?? meal.name?.de ?? meal.name?.en ?? 'Meal',
			price: formatPrice(meal.prices?.student),
			category: meal.category ?? 'main',
			restaurant: meal.restaurant ?? 'IngolstadtMensa'
		}))

	return meals
}
