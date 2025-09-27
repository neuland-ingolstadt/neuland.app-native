import type { FeatureCollection } from 'geojson'
import { Platform } from 'react-native'
import type {
	AppAnnouncementsQuery,
	CareerServiceEventsQuery,
	CreateRoomReportMutation,
	FoodPlanQuery,
	RoomReportInput,
	StudentCounsellingEventsQuery,
	TypedDocumentString,
	UniversitySportsQuery
} from '@/__generated__/gql/graphql'
import type { SpoWeights } from '@/types/asset-api'
import type {
	PublicEventResponse,
	PublicOrganizerResponse
} from '@/types/campus-life'
import packageInfo from '../../package.json'
import {
	ANNOUNCEMENT_QUERY,
	CAREER_SERVICE_EVENTS_QUERY,
	CREATE_ROOM_REPORT,
	FOOD_QUERY,
	STUDENT_ADVISORY_EVENTS_QUERY,
	UNIVERSITY_SPORTS_QUERY
} from './gql-documents'

const GRAPHQL_ENDPOINT: string =
	process.env.EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT ??
	'https://api.neuland.app/graphql'
const GRAPHQL_ENDPOINT_PROD = 'https://api.neuland.app/graphql'
const ASSET_ENDPOINT = 'https://assets.neuland.app'
const CAMPUS_LIFE_API_ENDPOINT = 'https://cl.neuland-ingolstadt.de'
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
		const headers: Record<string, string> = {}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const resp = await fetch(`${url}`, {
			headers
		})

		if (resp.status === 200) {
			return (await resp.json()) as unknown
		}
		throw new Error(`API returned an error: ${await resp.text()}`)
	}

	private async performCampusLifeRequest<TResult>(
		path: string,
		params?: Record<string, string | number | boolean | undefined>
	): Promise<TResult> {
		const url = new URL(`${CAMPUS_LIFE_API_ENDPOINT}${path}`)
		if (params != null) {
			Object.entries(params).forEach(([key, value]) => {
				if (value != null) {
					url.searchParams.set(key, String(value))
				}
			})
		}
		return (await this.performRequest(url.toString())) as TResult
	}

	/**
	 * Executes a GraphQL query against an endpoint
	 * @param query     The query to execute
	 * @param variables The variables to pass to the query
	 * @returns       The query result as a promise
	 */
	async executeGql<TResult, TVariables>(
		query: TypedDocumentString<TResult, TVariables>,
		forceProd = false,
		...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
	): Promise<TResult> {
		const resp = await fetch(
			forceProd ? GRAPHQL_ENDPOINT_PROD : GRAPHQL_ENDPOINT,
			{
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
			}
		)

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
		return await this.executeGql(ANNOUNCEMENT_QUERY, true)
	}

	async getFoodPlan(locations: string[]): Promise<FoodPlanQuery> {
		return await this.executeGql(FOOD_QUERY, false, { locations })
	}

	/**
	 * Gets the campus life events
	 * @returns {Promise<any>} A promise that resolves with the campus life events data
	 */
	async getPublicCampusLifeEvents(options?: {
		organizerId?: number
		upcomingOnly?: boolean
		limit?: number
		offset?: number
	}): Promise<PublicEventResponse[]> {
		return await this.performCampusLifeRequest<PublicEventResponse[]>(
			'/api/v1/public/events',
			{
				organizer_id: options?.organizerId,
				upcoming_only: options?.upcomingOnly,
				limit: options?.limit,
				offset: options?.offset
			}
		)
	}

	async getPublicCampusLifeEvent(id: number): Promise<PublicEventResponse> {
		return await this.performCampusLifeRequest<PublicEventResponse>(
			`/api/v1/public/events/${id}`
		)
	}

	async getPublicOrganizers(): Promise<PublicOrganizerResponse[]> {
		return await this.performCampusLifeRequest<PublicOrganizerResponse[]>(
			'/api/v1/public/organizers'
		)
	}

	async getPublicOrganizer(id: number): Promise<PublicOrganizerResponse> {
		return await this.performCampusLifeRequest<PublicOrganizerResponse>(
			`/api/v1/public/organizers/${id}`
		)
	}

	/**
	 * Gets the university sports events
	 * @returns {Promise<GetUniversitySportsData>} A promise that resolves with the university sports events data
	 */
	async getUniversitySports(): Promise<UniversitySportsQuery> {
		return await this.executeGql(UNIVERSITY_SPORTS_QUERY)
	}

	/**
	 * Gets the career service events
	 * @returns {Promise<CareerServiceEventsQuery>} A promise that resolves with the career service events data
	 */
	async getCareerServiceEvents(): Promise<CareerServiceEventsQuery> {
		return await this.executeGql(CAREER_SERVICE_EVENTS_QUERY)
	}

	/**
	 * Gets the student counselling events
	 * @returns {Promise<StudentCounsellingEventsQuery>} A promise that resolves with the student counselling events data
	 */
	async getStudentCounsellingEvents(): Promise<StudentCounsellingEventsQuery> {
		return await this.executeGql(STUDENT_ADVISORY_EVENTS_QUERY)
	}

	/**
	 * Gets the map overlay
	 * @returns {Promise<any>} A promise that resolves with the map overlay data
	 */
	async getMapOverlay(): Promise<FeatureCollection> {
		return (await this.performRequest(
			`${ASSET_ENDPOINT}/rooms_neuland_v2.6.geojson`
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
		return await this.executeGql(CREATE_ROOM_REPORT, false, { input })
	}
}

export default new NeulandAPIClient()
