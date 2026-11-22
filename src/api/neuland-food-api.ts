import type { components, paths } from '@neuland-ingolstadt/backend-food-api'
import createClient, { type Middleware } from 'openapi-fetch'
import { Platform } from 'react-native'
import { appHomepage, appVersion } from '@/data/app-version'
import type { Restaurant } from './food-meal-mapping'

export type Problem = components['schemas']['Problem']
export type MealDay = components['schemas']['MealDay']
export type { Restaurant }

const FOOD_API_BASE_URL =
	process.env.EXPO_PUBLIC_NEULAND_FOOD_API ?? 'https://api.neuland.app/food/v1'

const USER_AGENT = `neuland.app-native/${appVersion} (+${appHomepage})`

const userAgentMiddleware: Middleware = {
	async onRequest({ request }) {
		if (Platform.OS !== 'web') {
			request.headers.set('User-Agent', USER_AGENT)
		}
		return request
	}
}

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

neulandFoodApi.use(userAgentMiddleware)

export class NeulandFoodApiError extends Error {
	readonly status: number
	readonly problem: Problem | undefined

	constructor(message: string, status: number, problem?: Problem) {
		super(message)
		this.name = 'NeulandFoodApiError'
		this.status = status
		this.problem = problem
	}
}

function isProblem(value: unknown): value is Problem {
	return (
		typeof value === 'object' &&
		value != null &&
		'status' in value &&
		'title' in value
	)
}

function unwrapData<T>(
	result: { data?: T; error?: unknown; response: Response },
	label: string
): T {
	if (result.error != null || result.data == null) {
		const problem = isProblem(result.error) ? result.error : undefined
		throw new NeulandFoodApiError(
			problem?.detail ??
				problem?.title ??
				`Food API ${label} failed: ${result.response.status}`,
			result.response.status,
			problem
		)
	}
	return result.data
}

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
	return unwrapData(result, 'meals')
}
