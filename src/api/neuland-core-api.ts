import type { components, paths } from '@neuland-ingolstadt/backend-core-api'
import createClient from 'openapi-fetch'
import {
	type NeulandOpenApiError,
	openApiUserAgentMiddleware,
	unwrapOpenApiData
} from './openapi-utils'

export type Announcement = components['schemas']['Announcement']
export type CreateRoomReportRequest =
	components['schemas']['CreateRoomReportRequest']
export type Problem = components['schemas']['Problem']
export type RoomReportCategoryEnum =
	components['schemas']['RoomReportCategoryEnum']
export type RoomReportResponse = components['schemas']['RoomReportResponse']
export type Sports = components['schemas']['Sports']
export type NeulandCoreApiError = NeulandOpenApiError

const CORE_API_BASE_URL =
	process.env.EXPO_PUBLIC_NEULAND_CORE_API || 'https://api.neuland.app/core/v1'

export const neulandCoreApi = createClient<paths>({
	baseUrl: CORE_API_BASE_URL
})

neulandCoreApi.use(openApiUserAgentMiddleware)

/** Public: list announcements (optionally including inactive). */
export async function listAnnouncements(
	includeInactive = false
): Promise<Announcement[]> {
	const result = await neulandCoreApi.GET('/announcements', {
		params: { query: { includeInactive } }
	})
	return unwrapOpenApiData(result, {
		errorName: 'NeulandCoreApiError',
		serviceLabel: 'Core API',
		operation: 'announcements'
	}).announcements
}

/** Public: list university sports offerings. */
export async function listUniversitySports(): Promise<Sports[]> {
	const result = await neulandCoreApi.GET('/university-sports')
	return unwrapOpenApiData(result, {
		errorName: 'NeulandCoreApiError',
		serviceLabel: 'Core API',
		operation: 'university-sports'
	}).sports
}

/** Public: create a room data report. */
export async function createRoomReport(
	body: CreateRoomReportRequest
): Promise<RoomReportResponse> {
	const result = await neulandCoreApi.POST('/room-reports', { body })
	return unwrapOpenApiData(result, {
		errorName: 'NeulandCoreApiError',
		serviceLabel: 'Core API',
		operation: 'room-reports'
	})
}
