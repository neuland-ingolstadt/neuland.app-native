import type { Middleware } from 'openapi-fetch'
import { Platform } from 'react-native'
import { appHomepage, appVersion } from '@/data/app-version'

/** RFC 7807-ish problem body returned by Neuland backend services. */
export interface OpenApiProblem {
	status?: number | string
	title?: string
	detail?: string
}

const USER_AGENT = `neuland.app-native/${appVersion} (+${appHomepage})`

export const openApiUserAgentMiddleware: Middleware = {
	async onRequest({ request }) {
		if (Platform.OS !== 'web') {
			request.headers.set('User-Agent', USER_AGENT)
		}
		return request
	}
}

export class NeulandOpenApiError extends Error {
	readonly status: number
	readonly problem: OpenApiProblem | undefined

	constructor(
		name: string,
		message: string,
		status: number,
		problem?: OpenApiProblem
	) {
		super(message)
		this.name = name
		this.status = status
		this.problem = problem
	}
}

export function isOpenApiProblem(value: unknown): value is OpenApiProblem {
	return (
		typeof value === 'object' &&
		value != null &&
		'status' in value &&
		'title' in value
	)
}

export function unwrapOpenApiData<T>(
	result: { data?: T; error?: unknown; response: Response },
	options: { errorName: string; serviceLabel: string; operation: string }
): T {
	if (result.error != null || result.data == null) {
		const problem = isOpenApiProblem(result.error) ? result.error : undefined
		throw new NeulandOpenApiError(
			options.errorName,
			problem?.detail ??
				problem?.title ??
				`${options.serviceLabel} ${options.operation} failed: ${result.response.status}`,
			result.response.status,
			problem
		)
	}
	return result.data
}
