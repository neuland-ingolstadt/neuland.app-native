import { Platform } from 'react-native'
import { appHomepage, appVersion } from '@/data/app-version'
import { STATUS_URL } from '@/data/constants'

const USER_AGENT = `neuland.app-native/${appVersion} (+${appHomepage})`
const GATUS_STATUSES_PATH = '/api/v1/endpoints'

export interface GatusConditionResult {
	condition: string
	success: boolean
}

export interface GatusProbeResult {
	status: number
	success: boolean
	timestamp: string
	conditionResults?: GatusConditionResult[]
}

export interface GatusEndpointStatus {
	name: string
	group: string
	key: string
	results: GatusProbeResult[]
}

function buildStatusUrl(endpointKey: string, pageSize = 2): string {
	const base = STATUS_URL.replace(/\/$/, '')
	return `${base}${GATUS_STATUSES_PATH}/${endpointKey}/statuses?page=1&pageSize=${String(pageSize)}`
}

class GatusAPIClient {
	/**
	 * Latest probe results for a single Gatus endpoint (`group_name` key).
	 */
	async getEndpointStatuses(
		endpointKey: string,
		pageSize = 2
	): Promise<GatusEndpointStatus> {
		const headers: Record<string, string> = {
			Accept: 'application/json'
		}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const response = await fetch(buildStatusUrl(endpointKey, pageSize), {
			headers
		})
		if (!response.ok) {
			throw new Error(
				`Gatus returned ${String(response.status)} for ${endpointKey}`
			)
		}

		return (await response.json()) as GatusEndpointStatus
	}
}

export default new GatusAPIClient()
