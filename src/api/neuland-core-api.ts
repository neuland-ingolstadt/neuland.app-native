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
