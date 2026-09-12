import type { GatusEndpointStatus, GatusProbeResult } from '@/api/gatus-api'
import GatusAPI from '@/api/gatus-api'

/**
 * Opt-in fake outage for local UI checks.
 * Set `EXPO_PUBLIC_STATUS_BANNER_PREVIEW=1` to force a sample unhealthy snapshot.
 */
export function isStatusBannerPreview(): boolean {
	return process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW === '1'
}

export const STATUS_BANNER_PREVIEW = isStatusBannerPreview()

export const ServiceStatus = {
	Thi: 'thi',
	Neuland: 'neuland',
	CampusLife: 'campusLife',
	Map: 'map'
} as const

export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus]

export interface CriticalEndpoint {
	id: ServiceStatus
	/** Gatus endpoint key (`group_name`) */
	key: string
}

/** App-critical monitors only — ignore beta, landing, office presence, etc. */
export const CRITICAL_GATUS_ENDPOINTS: readonly CriticalEndpoint[] = [
	{ id: ServiceStatus.Thi, key: 'neuland-app_thi-api' },
	{ id: ServiceStatus.Neuland, key: 'neuland-app_neuland-api' },
	{ id: ServiceStatus.CampusLife, key: 'neuland-app_campus-life-api' },
	{ id: ServiceStatus.Map, key: 'neuland-app_map-server' }
] as const

export interface ServiceHealth {
	id: ServiceStatus
	key: string
	name: string
	healthy: boolean
}

export interface ServiceStatusSnapshot {
	services: ServiceHealth[]
	unhealthy: ServiceHealth[]
	/** Stable id for dismiss / analytics — sorted unhealthy ids */
	signature: string
	fetchedAt: number
}

export const EMPTY_UNHEALTHY: readonly ServiceHealth[] = []

/**
 * Gatus may return probes oldest-first; always evaluate newest first.
 */
export function sortProbesNewestFirst(
	results: GatusProbeResult[]
): GatusProbeResult[] {
	return [...results].sort((a, b) => {
		const aTime = Date.parse(a.timestamp)
		const bTime = Date.parse(b.timestamp)
		if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0
		return bTime - aTime
	})
}

/**
 * Avoid single-probe flaps: treat as unhealthy only when the latest probe
 * failed and the previous one (if present) also failed.
 */
export function isEndpointUnhealthy(results: GatusProbeResult[]): boolean {
	if (results.length === 0) return false
	const [latest, previous] = sortProbesNewestFirst(results)
	if (latest.success) return false
	if (previous == null) return true
	return !previous.success
}

function normalizeServiceIds(
	services: ServiceStatus | readonly ServiceStatus[]
): readonly ServiceStatus[] {
	return typeof services === 'string' ? [services] : services
}

/** True when any of the screen's related services is currently down. */
export function matchesServiceOutage(
	isDown: (id: ServiceStatus) => boolean,
	services: ServiceStatus | readonly ServiceStatus[] | undefined
): boolean {
	if (services == null) return false
	return normalizeServiceIds(services).some((id) => isDown(id))
}

/** Unhealthy services that overlap with the screen's related set. */
export function filterMatchingOutages(
	unhealthy: readonly ServiceHealth[],
	services: ServiceStatus | readonly ServiceStatus[] | undefined
): ServiceHealth[] {
	if (services == null || unhealthy.length === 0) return []
	const ids = new Set(normalizeServiceIds(services))
	return unhealthy.filter((service) => ids.has(service.id))
}

export function buildSignature(unhealthyIds: ServiceStatus[]): string {
	return [...unhealthyIds].sort().join('|')
}

export function shouldShowServiceStatusBanner(
	hasOutage: boolean,
	signature: string,
	dismissedSignature: string | null
): boolean {
	return hasOutage && dismissedSignature !== signature
}

export function shouldClearDismissedSignature(
	isSuccess: boolean,
	hasOutage: boolean,
	dismissedSignature: string | null
): boolean {
	return isSuccess && !hasOutage && dismissedSignature != null
}

export function createPreviewSnapshot(
	ids: ServiceStatus[] = [ServiceStatus.Thi, ServiceStatus.Neuland]
): ServiceStatusSnapshot {
	const services: ServiceHealth[] = CRITICAL_GATUS_ENDPOINTS.map((endpoint) => {
		const unhealthy = ids.includes(endpoint.id)
		return {
			id: endpoint.id,
			key: endpoint.key,
			name: endpoint.id,
			healthy: !unhealthy
		}
	})
	const unhealthy = services.filter((s) => !s.healthy)
	return {
		services,
		unhealthy,
		signature: buildSignature(unhealthy.map((s) => s.id)),
		fetchedAt: Date.now()
	}
}

function healthyFallbackSnapshot(): ServiceStatusSnapshot {
	const services: ServiceHealth[] = CRITICAL_GATUS_ENDPOINTS.map(
		(endpoint) => ({
			id: endpoint.id,
			key: endpoint.key,
			name: endpoint.id,
			healthy: true
		})
	)
	return {
		services,
		unhealthy: [],
		signature: '',
		fetchedAt: Date.now()
	}
}

function healthFromEndpoint(
	endpoint: CriticalEndpoint,
	data: GatusEndpointStatus | undefined
): ServiceHealth {
	if (data == null) {
		// Missing from bulk response → don't claim an outage
		return {
			id: endpoint.id,
			key: endpoint.key,
			name: endpoint.id,
			healthy: true
		}
	}

	return {
		id: endpoint.id,
		key: endpoint.key,
		name: data.name || endpoint.id,
		healthy: !isEndpointUnhealthy(data.results ?? [])
	}
}

/**
 * Fetches health for critical Gatus endpoints via one bulk statuses request.
 * Fail-closed for the banner: if Gatus itself is unreachable, returns healthy.
 */
export async function fetchCriticalServiceStatus(): Promise<ServiceStatusSnapshot> {
	if (isStatusBannerPreview()) {
		return createPreviewSnapshot()
	}

	try {
		const all = await GatusAPI.getEndpointStatuses(2)
		const byKey = new Map(all.map((endpoint) => [endpoint.key, endpoint]))

		const services = CRITICAL_GATUS_ENDPOINTS.map((endpoint) =>
			healthFromEndpoint(endpoint, byKey.get(endpoint.key))
		)
		const unhealthy = services.filter((service) => !service.healthy)

		return {
			services,
			unhealthy,
			signature: buildSignature(unhealthy.map((s) => s.id)),
			fetchedAt: Date.now()
		}
	} catch {
		return healthyFallbackSnapshot()
	}
}
