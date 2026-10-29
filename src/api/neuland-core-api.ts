import type { components, paths } from '@neuland-ingolstadt/backend-core-api'
import createClient, { type Middleware } from 'openapi-fetch'
import { Platform } from 'react-native'
import { appHomepage, appVersion } from '@/data/app-version'

export type Announcement = components['schemas']['Announcement']
export type CreateRoomReportRequest =
	components['schemas']['CreateRoomReportRequest']
export type Problem = components['schemas']['Problem']
export type RoomReportCategoryEnum =
	components['schemas']['RoomReportCategoryEnum']
export type RoomReportResponse = components['schemas']['RoomReportResponse']
export type Sports = components['schemas']['Sports']

const CORE_API_BASE_URL =
	process.env.EXPO_PUBLIC_NEULAND_CORE_API ?? 'https://core.api.neuland.app'

const USER_AGENT = `neuland.app-native/${appVersion} (+${appHomepage})`

const userAgentMiddleware: Middleware = {
	async onRequest({ request }) {
		if (Platform.OS !== 'web') {
			request.headers.set('User-Agent', USER_AGENT)
		}
		return request
	}
}

export const neulandCoreApi = createClient<paths>({
	baseUrl: CORE_API_BASE_URL
})

neulandCoreApi.use(userAgentMiddleware)

export class NeulandCoreApiError extends Error {
	readonly status: number
	readonly problem: Problem | undefined

	constructor(message: string, status: number, problem?: Problem) {
		super(message)
		this.name = 'NeulandCoreApiError'
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
		throw new NeulandCoreApiError(
			problem?.detail ??
				problem?.title ??
				`Core API ${label} failed: ${result.response.status}`,
			result.response.status,
			problem
		)
	}
	return result.data
}

/** Public: list announcements (optionally including inactive). */
export async function listAnnouncements(
	includeInactive = false
): Promise<Announcement[]> {
	const result = await neulandCoreApi.GET('/announcements', {
		params: { query: { includeInactive } }
	})
	return unwrapData(result, 'announcements').announcements
}

/** Public: list university sports offerings. */
export async function listUniversitySports(): Promise<Sports[]> {
	const result = await neulandCoreApi.GET('/university-sports')
	return unwrapData(result, 'university-sports').sports
}

/** Public: create a room data report. */
export async function createRoomReport(
	body: CreateRoomReportRequest
): Promise<RoomReportResponse> {
	const result = await neulandCoreApi.POST('/room-reports', { body })
	return unwrapData(result, 'room-reports')
}

export type FeedbackRating = 1 | 2 | 3 | 4 | 5

export type FeedbackCategory =
	| 'bugs'
	| 'performance'
	| 'login'
	| 'usability'
	| 'design'
	| 'missingFeature'
	| 'timetable'
	| 'food'
	| 'grades'
	| 'map'

export type FeatureIdea =
	| 'digitalId'
	| 'mensaPayment'
	| 'librarySeats'
	| 'roomNavigation'

/** 1 = not wanted at all, 4 = absolutely wanted. Even scale, no neutral option. */
export type FeatureInterest = 1 | 2 | 3 | 4

export type FeatureInterestAnswers = Partial<
	Record<FeatureIdea, FeatureInterest>
>

export interface FeedbackSubmission {
	/**
	 * Generated on the client so the rating can be stored right away and the
	 * details added later under the same id (upsert).
	 */
	id: string
	campaign: string
	rating: FeedbackRating
	categories?: FeedbackCategory[]
	comment?: string
	featureInterest?: FeatureInterestAnswers
	missingFeatures?: string
}

const SIMULATED_FEEDBACK_LATENCY_MS = 800

/**
 * Public: create or update an app feedback entry.
 *
 * The backend endpoint does not exist yet, so this only simulates a request.
 * Once it ships, replace the body with `neulandCoreApi.PUT(...)` + `unwrapData`
 * and derive the types from the generated schema — callers stay unchanged.
 */
export async function submitFeedback(
	submission: FeedbackSubmission
): Promise<void> {
	const body = { ...submission, platform: Platform.OS, appVersion }
	if (__DEV__) {
		console.debug('[feedback] simulated submit', body)
	}
	await new Promise((resolve) =>
		setTimeout(resolve, SIMULATED_FEEDBACK_LATENCY_MS)
	)
}
