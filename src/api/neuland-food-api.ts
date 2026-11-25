import type { components, paths } from '@neuland-ingolstadt/backend-food-api'
import createClient from 'openapi-fetch'
import type { Restaurant } from './food-meal-mapping'
import {
	type NeulandOpenApiError,
	openApiUserAgentMiddleware,
	unwrapOpenApiData
} from './openapi-utils'

export type Problem = components['schemas']['Problem']
export type MealDay = components['schemas']['MealDay']
export type { Restaurant }
export type NeulandFoodApiError = NeulandOpenApiError

const FOOD_API_BASE_URL =
	process.env.EXPO_PUBLIC_NEULAND_FOOD_API || 'https://api.neuland.app/food/v1'

export const neulandFoodApi = createClient<paths>({
	baseUrl: FOOD_API_BASE_URL,
	// Contract: style=form, explode=false → restaurants=A,B
	querySerializer: {
		array: {
			style: 'form',
			explode: false
		}
	}
})

neulandFoodApi.use(openApiUserAgentMiddleware)

/** Public: list meals for restaurants in an inclusive date range. */
export async function listMeals(options: {
	restaurants: Restaurant[]
	mealDateFrom: string
	mealDateTo: string
}): Promise<MealDay[]> {
	const result = await neulandFoodApi.GET('/meals', {
		params: {
			query: {
				restaurants: options.restaurants,
				mealDateFrom: options.mealDateFrom,
				mealDateTo: options.mealDateTo
			}
		}
	})
	return unwrapOpenApiData(result, {
		errorName: 'NeulandFoodApiError',
		serviceLabel: 'Food API',
		operation: 'meals'
	})
}
