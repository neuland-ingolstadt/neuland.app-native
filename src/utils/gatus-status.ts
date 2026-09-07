import { Platform } from 'react-native'
import { appHomepage, appVersion } from '@/data/app-version'
import { STATUS_URL } from '@/data/constants'

const USER_AGENT = `neuland.app-native/${appVersion} (+${appHomepage})`
const GATUS_STATUSES_PATH = '/api/v1/endpoints'

/**
 * Opt-in fake outage for local UI checks.
 * Set `EXPO_PUBLIC_STATUS_BANNER_PREVIEW=1` to force a sample unhealthy snapshot.
 */
export function isStatusBannerPreview(): boolean {
	return process.env.EXPO_PUBLIC_STATUS_BANNER_PREVIEW === '1'
}

export const STATUS_BANNER_PREVIEW = isStatusBannerPreview()

export enum ServiceStatus {
	Thi = 'thi',
	Neuland = 'neuland',
	CampusLife = 'campusLife',
	Map = 'map'
}

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

interface GatusConditionResult {
	condition: string
	success: boolean
}

interface GatusProbeResult {
	status: number
	success: boolean
	timestamp: string
	conditionResults?: GatusConditionResult[]
}

interface GatusEndpointStatus {
	name: string
	group: string
	key: string
	results: GatusProbeResult[]
}

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

function buildStatusUrl(endpointKey: string, pageSize = 2): string {
	const base = STATUS_URL.replace(/\/$/, '')
	return `${base}${GATUS_STATUSES_PATH}/${endpointKey}/statuses?page=1&pageSize=${String(pageSize)}`
}

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

/** True when any of the screen's related services is currently down. */
export function matchesServiceOutage(
	isDown: (id: ServiceStatus) => boolean,
	services: ServiceStatus | readonly ServiceStatus[] | undefined
): boolean {
	if (services == null) return false
	const ids = typeof services === 'string' ? [services] : services
	return ids.some((id) => isDown(id))
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

async function fetchEndpointStatus(
	endpoint: CriticalEndpoint
): Promise<ServiceHealth> {
	const headers: Record<string, string> = {
		Accept: 'application/json'
	}
	if (Platform.OS !== 'web') {
		headers['User-Agent'] = USER_AGENT
	}

	const response = await fetch(buildStatusUrl(endpoint.key), { headers })
	if (!response.ok) {
		throw new Error(
			`Gatus returned ${String(response.status)} for ${endpoint.key}`
		)
	}

	const data = (await response.json()) as GatusEndpointStatus
	const healthy = !isEndpointUnhealthy(data.results ?? [])

	return {
		id: endpoint.id,
		key: endpoint.key,
		name: data.name || endpoint.id,
		healthy
	}
}

/**
 * Fetches health for critical Gatus endpoints.
 * Fail-closed for the banner: if Gatus itself is unreachable, returns healthy.
 */
export async function fetchCriticalServiceStatus(): Promise<ServiceStatusSnapshot> {
	if (isStatusBannerPreview()) {
		return createPreviewSnapshot()
	}

	const settled = await Promise.allSettled(
		CRITICAL_GATUS_ENDPOINTS.map((endpoint) => fetchEndpointStatus(endpoint))
	)

	const services: ServiceHealth[] = settled.map((result, index) => {
		const endpoint = CRITICAL_GATUS_ENDPOINTS[index]
		if (result.status === 'fulfilled') {
			return result.value
		}
		// Gatus unreachable for this probe → don't claim an outage
		return {
			id: endpoint.id,
			key: endpoint.key,
			name: endpoint.id,
			healthy: true
		}
	})

	const unhealthy = services.filter((service) => !service.healthy)

	return {
		services,
		unhealthy,
		signature: buildSignature(unhealthy.map((s) => s.id)),
		fetchedAt: Date.now()
	}
}
