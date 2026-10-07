import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { corridorFeaturesFromFC } from './corridor'
import { FLOORS } from './floors'
import { buildIndoorGraph } from './graph-build'
import type {
	DoorFeature,
	EntranceFeature,
	FloorId,
	IndoorData,
	IndoorGraph,
	RoomFeature
} from './types'

/** Buildings with indoor navigation data (Ingolstadt). */
export const INDOOR_BUILDINGS = ['G', 'J', 'K', 'W'] as const
export type IndoorBuilding = (typeof INDOOR_BUILDINGS)[number]
/** Legacy single-building export — G was the first mapped building. */
export const INDOOR_BUILDING = 'G' as const
export const INDOOR_STANDORT = 'IN' as const

const INDOOR_ETAGEN = new Set<FloorId>(FLOORS)
const INDOOR_GEBAEUDE = new Set<string>(INDOOR_BUILDINGS)

function isIndoorBuilding(
	props:
		| { Standort?: unknown; Gebaeude?: unknown; Etage?: unknown }
		| null
		| undefined
): boolean {
	return (
		props?.Standort === INDOOR_STANDORT &&
		typeof props?.Gebaeude === 'string' &&
		INDOOR_GEBAEUDE.has(props.Gebaeude)
	)
}

function roomFeaturesFromOverlay(overlay: FeatureCollection): RoomFeature[] {
	const out: RoomFeature[] = []
	for (const feature of overlay.features) {
		const props = feature.properties as RoomFeature['properties'] | null
		if (
			!isIndoorBuilding(props) ||
			typeof props?.Etage !== 'string' ||
			!INDOOR_ETAGEN.has(props.Etage as FloorId)
		) {
			continue
		}
		if (feature.geometry?.type === 'Polygon') {
			out.push(feature as RoomFeature)
		} else if (feature.geometry?.type === 'MultiPolygon') {
			out.push(feature as RoomFeature)
		} else if (feature.geometry?.type === 'GeometryCollection') {
			// e.g. J001 ships a Polygon plus a LineString member — keep the polygon.
			const polygon = feature.geometry.geometries.find(
				(g): g is GeoJSON.Polygon | GeoJSON.MultiPolygon =>
					g.type === 'Polygon' || g.type === 'MultiPolygon'
			)
			if (polygon != null) {
				out.push({ ...feature, geometry: polygon } as RoomFeature)
			}
		}
	}
	return out
}

/** True when the given feature belongs to a mapped building (IN/G,J,K,W). */
export function isIndoorFeature(
	feature:
		| {
				properties?: { Standort?: unknown; Gebaeude?: unknown } | null
		  }
		| null
		| undefined
): boolean {
	return isIndoorBuilding(feature?.properties)
}

export function buildIndoorDataFromGeoJson(
	roomsOverlay: FeatureCollection,
	doorsFc: FeatureCollection,
	entrancesFc: FeatureCollection,
	corridorsFc: FeatureCollection
): IndoorData {
	const roomsByFloor = Object.fromEntries(
		FLOORS.map((floor) => [floor, [] as RoomFeature[]])
	) as Record<string, RoomFeature[]>

	for (const room of roomFeaturesFromOverlay(roomsOverlay)) {
		const floor = String(room.properties.Etage)
		roomsByFloor[floor]?.push(room)
	}

	const doors = doorsFc.features.filter(
		(feature): feature is DoorFeature =>
			feature.geometry?.type === 'Point' && isIndoorBuilding(feature.properties)
	)

	const entrances = entrancesFc.features.filter(
		(feature): feature is EntranceFeature =>
			feature.geometry?.type === 'Point' && isIndoorBuilding(feature.properties)
	)

	const corridorsByFloor = Object.fromEntries(
		FLOORS.map((floor) => [
			floor,
			corridorFeaturesFromFC({
				type: 'FeatureCollection',
				features: corridorsFc.features.filter(
					(feature) =>
						feature.geometry?.type === 'LineString' &&
						isIndoorBuilding(feature.properties) &&
						String(feature.properties?.Etage) === floor
				)
			})
		])
	) as Record<string, ReturnType<typeof corridorFeaturesFromFC>>

	return {
		roomsByFloor,
		doors,
		entrances,
		corridorsByFloor
	}
}

export async function loadIndoorDataFromAssets(
	roomsOverlay?: FeatureCollection
): Promise<IndoorData> {
	const rooms = roomsOverlay ?? (await NeulandAPI.getMapOverlay())
	const [doors, entrances, corridors] = await Promise.all([
		NeulandAPI.getIndoorDoors(),
		NeulandAPI.getIndoorEntrances(),
		NeulandAPI.getIndoorCorridors()
	])
	const data = buildIndoorDataFromGeoJson(rooms, doors, entrances, corridors)
	applyIndoorData(data)
	return data
}

export function indoorFloors(): string[] {
	return [...FLOORS]
}

let cachedData: IndoorData | null = null
let cachedGraph: IndoorGraph | null = null
/** Room code → floors where that code exists in a mapped building. */
let cachedRoomFloorsByCode: Map<string, string[]> | null = null
/** Room code → building (e.g. `G001` → `G`). Codes are unique across buildings. */
let cachedBuildingByCode: Map<string, string> | null = null

function buildingFromRoomCode(code: string): IndoorBuilding | null {
	const letter = code[0]?.toUpperCase()
	if (letter != null && INDOOR_GEBAEUDE.has(letter)) {
		return letter as IndoorBuilding
	}
	return null
}

function rebuildRoomFloorsByCode(data: IndoorData): Map<string, string[]> {
	const index = new Map<string, string[]>()
	const buildings = new Map<string, string>()
	for (const floor of FLOORS) {
		for (const room of data.roomsByFloor[floor] ?? []) {
			const code = room.properties.Raum
			const floors = index.get(code)
			if (floors == null) {
				index.set(code, [floor])
			} else if (!floors.includes(floor)) {
				floors.push(floor)
			}
			if (!buildings.has(code)) {
				buildings.set(code, room.properties.Gebaeude)
			}
		}
	}
	cachedBuildingByCode = buildings
	return index
}

function ensureRoomFloorsByCodeIndex(): Map<string, string[]> | null {
	if (cachedRoomFloorsByCode != null) {
		return cachedRoomFloorsByCode
	}
	if (cachedData == null) {
		return null
	}
	cachedRoomFloorsByCode = rebuildRoomFloorsByCode(cachedData)
	return cachedRoomFloorsByCode
}

/** Floors that contain `code` in a mapped building (empty when data is not loaded). */
export function getIndoorRoomFloorsForCode(code: string): string[] {
	return ensureRoomFloorsByCodeIndex()?.get(code) ?? []
}

/** Building (`G`, `J`, `K`, `W`) that contains `code`, if loaded. */
export function getIndoorBuildingForCode(code: string): string | null {
	ensureRoomFloorsByCodeIndex()
	const mapped = cachedBuildingByCode?.get(code)
	if (mapped != null) {
		return mapped
	}
	const floors = cachedRoomFloorsByCode?.get(code) ?? []
	if (floors.length === 0) {
		return null
	}
	return buildingFromRoomCode(code)
}

export function isIndoorDataLoaded(): boolean {
	return cachedData != null
}

export function applyIndoorData(data: IndoorData): void {
	if (cachedData === data) {
		ensureRoomFloorsByCodeIndex()
		if (cachedBuildingByCode == null && cachedData != null) {
			cachedRoomFloorsByCode = rebuildRoomFloorsByCode(cachedData)
		}
		return
	}
	cachedData = data
	cachedGraph = null
	cachedRoomFloorsByCode = rebuildRoomFloorsByCode(data)
}

export function resetIndoorDataCache(): void {
	cachedData = null
	cachedGraph = null
	cachedRoomFloorsByCode = null
	cachedBuildingByCode = null
}

export function getIndoorData(): IndoorData {
	if (cachedData == null) {
		throw new Error('Indoor navigation data is not loaded yet')
	}
	return cachedData
}

export function getIndoorGraph(): IndoorGraph {
	if (cachedGraph == null) {
		cachedGraph = buildIndoorGraph(getIndoorData())
	}
	return cachedGraph
}
