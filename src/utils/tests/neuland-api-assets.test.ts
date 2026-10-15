import { afterEach, describe, expect, it, mock } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import NeulandAPI, {
	INDOOR_CORRIDORS_GEOJSON_URL,
	INDOOR_DOORS_GEOJSON_URL,
	INDOOR_ENTRANCES_GEOJSON_URL,
	INDOOR_FOOTPATHS_GEOJSON_URL,
	MAP_ROOMS_GEOJSON_URL
} from '@/api/neuland-api'
import { reactNativePlatform } from './react-native-mock'

const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] }

function stubFetch(payload: unknown = EMPTY_FC) {
	const fetchMock = mock(async (_input: RequestInfo | URL) => {
		return new Response(JSON.stringify(payload), { status: 200 })
	})
	globalThis.fetch = fetchMock as unknown as typeof fetch
	return fetchMock
}

describe('neuland-api indoor asset endpoints', () => {
	const originalFetch = globalThis.fetch
	const originalOs = reactNativePlatform.OS

	afterEach(() => {
		globalThis.fetch = originalFetch
		reactNativePlatform.OS = originalOs
	})

	it('exposes stable asset urls', () => {
		expect(MAP_ROOMS_GEOJSON_URL).toContain('rooms_neuland_v2.7.geojson')
		expect(INDOOR_DOORS_GEOJSON_URL).toContain('doors_neuland.geojson')
		expect(INDOOR_ENTRANCES_GEOJSON_URL).toContain('entrances_neuland.geojson')
		expect(INDOOR_CORRIDORS_GEOJSON_URL).toContain('corridors_neuland.geojson')
		expect(INDOOR_FOOTPATHS_GEOJSON_URL).toContain('footpaths_neuland.geojson')
	})

	it('fetches indoor doors from the asset endpoint', async () => {
		const fetchMock = stubFetch()
		const result = await NeulandAPI.getIndoorDoors()
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(String(fetchMock.mock.calls[0]?.[0])).toBe(INDOOR_DOORS_GEOJSON_URL)
		expect(result).toEqual(EMPTY_FC)
	})

	it('fetches indoor entrances from the asset endpoint', async () => {
		const fetchMock = stubFetch()
		const result = await NeulandAPI.getIndoorEntrances()
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
			INDOOR_ENTRANCES_GEOJSON_URL
		)
		expect(result).toEqual(EMPTY_FC)
	})

	it('fetches indoor corridors from the asset endpoint', async () => {
		const fetchMock = stubFetch()
		const result = await NeulandAPI.getIndoorCorridors()
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
			INDOOR_CORRIDORS_GEOJSON_URL
		)
		expect(result).toEqual(EMPTY_FC)
	})

	it('fetches indoor footpaths from the asset endpoint', async () => {
		const fetchMock = stubFetch()
		const result = await NeulandAPI.getIndoorFootpaths()
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
			INDOOR_FOOTPATHS_GEOJSON_URL
		)
		expect(result).toEqual(EMPTY_FC)
	})

	it('sends a user agent on native and throws on errors', async () => {
		reactNativePlatform.OS = 'ios'
		const fetchMock = mock(
			async (_input: RequestInfo | URL, _init?: RequestInit) => {
				return new Response('oops', { status: 500 })
			}
		)
		globalThis.fetch = fetchMock as unknown as typeof fetch

		await expect(NeulandAPI.getIndoorFootpaths()).rejects.toThrow(
			'API returned an error'
		)
		const init = fetchMock.mock.calls[0]?.[1] as
			| { headers?: Record<string, string> }
			| undefined
		expect(init?.headers?.['User-Agent']).toContain('neuland.app-native/')
	})
})
