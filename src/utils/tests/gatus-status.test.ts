import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { reactNativePlatform } from './react-native-mock'

const {
	buildSignature,
	createPreviewSnapshot,
	CRITICAL_GATUS_ENDPOINTS,
	fetchCriticalServiceStatus,
	filterMatchingOutages,
	isEndpointUnhealthy,
	isStatusBannerPreview,
	matchesServiceOutage,
	ServiceStatus,
	shouldClearDismissedSignature,
	shouldShowServiceStatusBanner,
	sortProbesNewestFirst
} = await import('../gatus-status')

function probe(
	success: boolean,
	status = success ? 200 : 500,
	timestamp = '2026-01-01T00:00:00Z'
) {
	return {
		status,
		success,
		timestamp
	}
}

function gatusJson(
	key: string,
	results: ReturnType<typeof probe>[],
	name?: string
) {
	return {
		name: name ?? key,
		group: 'Neuland App',
		key,
		results
	}
}

function bulkResponse(
	overrides: Partial<
		Record<
			(typeof CRITICAL_GATUS_ENDPOINTS)[number]['key'],
			ReturnType<typeof gatusJson>
		>
	> = {}
) {
	return CRITICAL_GATUS_ENDPOINTS.map((endpoint) => {
		const override = overrides[endpoint.key]
		if (override != null) return override
		return gatusJson(endpoint.key, [probe(true)], endpoint.id)
	})
}

describe('isEndpointUnhealthy', () => {
	it('returns false for empty results', () => {
		expect(isEndpointUnhealthy([])).toBe(false)
	})

	it('returns false when latest probe succeeded', () => {
		expect(isEndpointUnhealthy([probe(true), probe(false)])).toBe(false)
	})

	it('returns true for a single failed probe', () => {
		expect(isEndpointUnhealthy([probe(false)])).toBe(true)
	})

	it('returns true when the last two probes failed', () => {
		expect(isEndpointUnhealthy([probe(false), probe(false, 503)])).toBe(true)
	})

	it('returns false when only the latest failed (flap protection)', () => {
		expect(isEndpointUnhealthy([probe(false), probe(true)])).toBe(false)
	})

	it('uses newest probe by timestamp regardless of array order', () => {
		// Oldest-first (as returned by live Gatus): newest failed, previous ok → flap
		expect(
			isEndpointUnhealthy([
				probe(true, 200, '2026-01-01T00:00:00Z'),
				probe(false, 500, '2026-01-01T00:01:00Z')
			])
		).toBe(false)
		// Newest-first: both failed → unhealthy
		expect(
			isEndpointUnhealthy([
				probe(false, 500, '2026-01-01T00:01:00Z'),
				probe(false, 503, '2026-01-01T00:00:00Z')
			])
		).toBe(true)
		// Oldest-first recovery: newest ok → healthy
		expect(
			isEndpointUnhealthy([
				probe(false, 500, '2026-01-01T00:00:00Z'),
				probe(true, 200, '2026-01-01T00:01:00Z')
			])
		).toBe(false)
	})
})

describe('sortProbesNewestFirst', () => {
	it('orders by timestamp descending', () => {
		const sorted = sortProbesNewestFirst([
			probe(true, 200, '2026-01-01T00:00:00Z'),
			probe(false, 500, '2026-01-01T00:02:00Z'),
			probe(true, 200, '2026-01-01T00:01:00Z')
		])
		expect(sorted.map((p) => p.timestamp)).toEqual([
			'2026-01-01T00:02:00Z',
			'2026-01-01T00:01:00Z',
			'2026-01-01T00:00:00Z'
		])
	})
})

describe('matchesServiceOutage', () => {
	const isDown = (id: (typeof ServiceStatus)[keyof typeof ServiceStatus]) =>
		id === ServiceStatus.Map

	it('returns false when no services are provided', () => {
		expect(matchesServiceOutage(isDown, undefined)).toBe(false)
	})

	it('matches a single related service', () => {
		expect(matchesServiceOutage(isDown, ServiceStatus.Map)).toBe(true)
		expect(matchesServiceOutage(isDown, ServiceStatus.Thi)).toBe(false)
	})

	it('matches when any related service is down', () => {
		expect(
			matchesServiceOutage(isDown, [ServiceStatus.Thi, ServiceStatus.Map])
		).toBe(true)
		expect(
			matchesServiceOutage(isDown, [ServiceStatus.Thi, ServiceStatus.Neuland])
		).toBe(false)
	})
})

describe('filterMatchingOutages', () => {
	const unhealthy = [
		{
			id: ServiceStatus.Map,
			key: 'neuland-app_map-server',
			name: 'map',
			healthy: false
		},
		{
			id: ServiceStatus.Thi,
			key: 'neuland-app_thi-api',
			name: 'thi',
			healthy: false
		}
	]

	it('returns empty when services are omitted', () => {
		expect(filterMatchingOutages(unhealthy, undefined)).toEqual([])
	})

	it('filters to overlapping services', () => {
		expect(filterMatchingOutages(unhealthy, ServiceStatus.Map)).toEqual([
			unhealthy[0]
		])
		expect(
			filterMatchingOutages(unhealthy, [
				ServiceStatus.Neuland,
				ServiceStatus.Thi
			])
		).toEqual([unhealthy[1]])
	})
})

describe('buildSignature', () => {
	it('sorts ids for a stable dismiss key', () => {
		expect(buildSignature([ServiceStatus.Neuland, ServiceStatus.Thi])).toBe(
			'neuland|thi'
		)
		expect(buildSignature([ServiceStatus.Thi, ServiceStatus.Neuland])).toBe(
			'neuland|thi'
		)
	})

	it('returns empty string for no outages', () => {
		expect(buildSignature([])).toBe('')
	})
})

describe('createPreviewSnapshot', () => {
	it('marks requested services unhealthy', () => {
		const snapshot = createPreviewSnapshot([
			ServiceStatus.Thi,
			ServiceStatus.Map
		])
		expect(snapshot.signature).toBe('map|thi')
		expect(snapshot.unhealthy.map((s) => s.id).sort()).toEqual([
			ServiceStatus.Map,
			ServiceStatus.Thi
		])
		expect(
			snapshot.services.find((s) => s.id === ServiceStatus.Neuland)?.healthy
		).toBe(true)
	})

	it('defaults to thi and neuland when no ids are passed', () => {
		const snapshot = createPreviewSnapshot()
		expect(snapshot.signature).toBe('neuland|thi')
		expect(snapshot.services).toHaveLength(CRITICAL_GATUS_ENDPOINTS.length)
	})
})

describe('shouldShowServiceStatusBanner', () => {
	it('shows when there is an outage that was not dismissed', () => {
		expect(shouldShowServiceStatusBanner(true, 'thi', null)).toBe(true)
		expect(shouldShowServiceStatusBanner(true, 'thi', 'map')).toBe(true)
	})

	it('hides when dismissed for the current signature or healthy', () => {
		expect(shouldShowServiceStatusBanner(true, 'thi', 'thi')).toBe(false)
		expect(shouldShowServiceStatusBanner(false, '', null)).toBe(false)
	})
})

describe('shouldClearDismissedSignature', () => {
	it('clears only after a successful healthy fetch with a prior dismiss', () => {
		expect(shouldClearDismissedSignature(true, false, 'thi')).toBe(true)
		expect(shouldClearDismissedSignature(true, true, 'thi')).toBe(false)
		expect(shouldClearDismissedSignature(false, false, 'thi')).toBe(false)
		expect(shouldClearDismissedSignature(true, false, null)).toBe(false)
	})
})

describe('isStatusBannerPreview', () => {
	afterEach(() => {
		delete process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW
	})

	it('is false by default and true when env is 1', () => {
		delete process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW
		expect(isStatusBannerPreview()).toBe(false)
		process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW = '1'
		expect(isStatusBannerPreview()).toBe(true)
		process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW = '0'
		expect(isStatusBannerPreview()).toBe(false)
	})
})

describe('fetchCriticalServiceStatus', () => {
	const originalFetch = globalThis.fetch

	beforeEach(() => {
		delete process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW
		reactNativePlatform.OS = 'ios'
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
		delete process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW
		reactNativePlatform.OS = 'web'
	})

	it('returns the preview snapshot when preview mode is enabled', async () => {
		process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW = '1'
		globalThis.fetch = mock(() => {
			throw new Error('fetch should not run in preview mode')
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.signature).toBe('neuland|thi')
		expect(snapshot.unhealthy).toHaveLength(2)
	})

	it('uses a single bulk statuses request', async () => {
		const fetchMock = mock(async (input: RequestInfo | URL) => {
			expect(String(input)).toContain('/api/v1/endpoints/statuses')
			expect(String(input)).not.toContain('neuland-app_thi-api/statuses')
			return new Response(JSON.stringify(bulkResponse()), { status: 200 })
		}) as unknown as typeof fetch
		globalThis.fetch = fetchMock

		await fetchCriticalServiceStatus()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it('marks services healthy when all probes succeed', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(JSON.stringify(bulkResponse()), { status: 200 })
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.unhealthy).toEqual([])
		expect(snapshot.signature).toBe('')
		expect(snapshot.services.every((s) => s.healthy)).toBe(true)
		expect(snapshot.services).toHaveLength(CRITICAL_GATUS_ENDPOINTS.length)
	})

	it('marks a service unhealthy after two failed probes', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify(
					bulkResponse({
						'neuland-app_thi-api': gatusJson(
							'neuland-app_thi-api',
							[probe(false), probe(false)],
							'THI-API'
						)
					})
				),
				{ status: 200 }
			)
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.signature).toBe('thi')
		expect(snapshot.unhealthy).toHaveLength(1)
		expect(snapshot.unhealthy[0]).toMatchObject({
			id: ServiceStatus.Thi,
			name: 'THI-API',
			healthy: false
		})
	})

	it('fails closed to healthy when Gatus returns a non-OK response', async () => {
		globalThis.fetch = mock(async () => {
			return new Response('nope', { status: 503 })
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.unhealthy).toEqual([])
		expect(snapshot.services.every((s) => s.healthy)).toBe(true)
	})

	it('fails closed to healthy when fetch rejects', async () => {
		globalThis.fetch = mock(async () => {
			throw new Error('network down')
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.unhealthy).toEqual([])
		expect(snapshot.services.every((s) => s.healthy)).toBe(true)
	})

	it('falls back to the endpoint id when Gatus omits a name', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify(
					CRITICAL_GATUS_ENDPOINTS.map((endpoint) => ({
						name: '',
						group: 'Neuland App',
						key: endpoint.key,
						results: [probe(true)]
					}))
				),
				{ status: 200 }
			)
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.services.map((s) => s.name)).toEqual(
			CRITICAL_GATUS_ENDPOINTS.map((e) => e.id)
		)
	})

	it('treats missing critical endpoints as healthy', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify([
					gatusJson('neuland-app_thi-api', [probe(false), probe(false)], 'THI')
				]),
				{ status: 200 }
			)
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.signature).toBe('thi')
		expect(
			snapshot.services
				.filter((s) => s.id !== ServiceStatus.Thi)
				.every((s) => s.healthy)
		).toBe(true)
	})

	it('sends a User-Agent on native and omits it on web', async () => {
		const headersSeen: Array<Record<string, string> | undefined> = []

		globalThis.fetch = mock(
			async (_input: RequestInfo | URL, init?: RequestInit) => {
				headersSeen.push(init?.headers as Record<string, string> | undefined)
				return new Response(JSON.stringify(bulkResponse()), { status: 200 })
			}
		) as unknown as typeof fetch

		reactNativePlatform.OS = 'ios'
		await fetchCriticalServiceStatus()
		expect(headersSeen[0]?.['User-Agent']).toContain('neuland.app-native/')

		headersSeen.length = 0
		reactNativePlatform.OS = 'web'
		await fetchCriticalServiceStatus()
		expect(headersSeen[0]?.['User-Agent']).toBeUndefined()
		expect(headersSeen[0]?.Accept).toBe('application/json')
	})

	it('treats missing results as healthy', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify([
					{
						name: 'THI-API',
						group: 'Neuland App',
						key: 'neuland-app_thi-api'
					},
					...CRITICAL_GATUS_ENDPOINTS.filter(
						(e) => e.key !== 'neuland-app_thi-api'
					).map((endpoint) => gatusJson(endpoint.key, [probe(true)]))
				]),
				{ status: 200 }
			)
		}) as unknown as typeof fetch

		const snapshot = await fetchCriticalServiceStatus()
		expect(snapshot.services.every((s) => s.healthy)).toBe(true)
	})
})
