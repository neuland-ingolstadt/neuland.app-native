import type {
	AppAnnouncementsQuery,
	CampusLifeEventsQuery,
	CreateRoomReportMutation,
	FoodPlanQuery,
	RoomReportInput,
	TypedDocumentString,
	UniversitySportsQuery
} from '@/__generated__/gql/graphql'
import type { SpoWeights } from '@/types/asset-api'
import type { FeatureCollection } from 'geojson'

import packageInfo from '../../package.json'
import {
	ANNOUNCEMENT_QUERY,
	CAMPUS_LIFE_EVENTS_QUERY,
	CREATE_ROOM_REPORT,
	FOOD_QUERY,
	UNIVERSITY_SPORTS_QUERY
} from './gql-documents'

const GRAPHQL_ENDPOINT: string =
	process.env.EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT ??
	'https://api.neuland.app/graphql'
console.info('Using GraphQL endpoint:', GRAPHQL_ENDPOINT)
const ASSET_ENDPOINT = 'https://assets.neuland.app'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

/**
 * Neuland API client class for performing requests against the neuland.app API
 */
class NeulandAPIClient {
	/**
	 * Performs a request against the neuland.app API
	 * @param {string} url The URL to perform the request against
	 * @returns {Promise<any>} A promise that resolves with the response data
	 * @throws {Error} If the API returns an error
	 */
	async performRequest(url: string): Promise<unknown> {
		const resp = await fetch(`${url}`, {
			headers: {
				'User-Agent': USER_AGENT
			}
		})

		if (resp.status === 200) {
			return (await resp.json()) as unknown
		}
		throw new Error(`API returned an error: ${await resp.text()}`)
	}

	/**
	 * Executes a GraphQL query against an endpoint
	 * @param query     The query to execute
	 * @param variables The variables to pass to the query
	 * @returns       The query result as a promise
	 */
	async executeGql<TResult, TVariables>(
		query: TypedDocumentString<TResult, TVariables>,
		...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
	): Promise<TResult> {
		const resp = await fetch(GRAPHQL_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/graphql-response+json',
				'User-Agent': USER_AGENT
			},
			body: JSON.stringify({
				query,
				variables
			})
		})

		const json = (await resp.json()) as { data?: TResult; errors?: unknown }

		if (resp.ok && json.errors == null) {
			return json.data as TResult
		}
		const errorMessage =
			json.errors != null ? JSON.stringify(json.errors) : resp.statusText
		throw new Error(`GraphQL error: ${errorMessage}`)
	}

	/**
	 * Get the announcement ndata from the GraphQL API
	 * @returns {Promise<AppAnnouncementsQuery>} A promise that resolves with the announcement data
	 */
	async getAnnouncements(): Promise<AppAnnouncementsQuery> {
		return await this.executeGql(ANNOUNCEMENT_QUERY)
	}

	async getFoodPlan(locations: string[]): Promise<FoodPlanQuery> {
		return await this.executeGql(FOOD_QUERY, { locations })
	}

	/**
	 * Gets the campus life events
	 * @returns {Promise<any>} A promise that resolves with the campus life events data
	 */
	async getCampusLifeEvents(): Promise<CampusLifeEventsQuery> {
		return await this.executeGql(CAMPUS_LIFE_EVENTS_QUERY)
	}

	/**
	 * Gets the university sports events
	 * @returns {Promise<GetUniversitySportsData>} A promise that resolves with the university sports events data
	 */
	async getUniversitySports(): Promise<UniversitySportsQuery> {
		return await this.executeGql(UNIVERSITY_SPORTS_QUERY)
	}

	/**
	 * Gets the map overlay
	 * @returns {Promise<any>} A promise that resolves with the map overlay data
	 */
	async getMapOverlay(): Promise<FeatureCollection> {
		return (await this.performRequest(
			`${ASSET_ENDPOINT}/rooms_neuland_v2.4.geojson`
		)) as FeatureCollection
	}

	/**
	 * Gets the course spo data (grade weights)
	 * @returns {Promise<SpoWeights>} A promise that resolves with the course spo data
	 */
	async getSpoWeights(): Promise<SpoWeights> {
		return (await this.performRequest(
			`${ASSET_ENDPOINT}/generated/spo-grade-weights.json`
		)) as SpoWeights
	}

	/**
	 * Create a new room report
	 * @returns {Promise<CreateRoomReportMutation>} A promise that resolves with the created report id
	 */
	async createRoomReport(
		input: RoomReportInput
	): Promise<CreateRoomReportMutation> {
		return await this.executeGql(CREATE_ROOM_REPORT, { input })
	}
}

export default new NeulandAPIClient()
