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

/** Building G (Ingolstadt) indoor data from assets.neuland.app. */
export const INDOOR_BUILDING = 'G' as const
export const INDOOR_STANDORT = 'IN' as const

const INDOOR_ETAGEN = new Set<FloorId>(FLOORS)

function isBuildingG(
	props:
		| { Standort?: unknown; Gebaeude?: unknown; Etage?: unknown }
		| null
		| undefined
): boolean {
	return (
		props?.Standort === INDOOR_STANDORT && props?.Gebaeude === INDOOR_BUILDING
	)
}

function roomFeaturesFromOverlay(overlay: FeatureCollection): RoomFeature[] {
	return overlay.features.filter((feature): feature is RoomFeature => {
		if (feature.geometry?.type !== 'Polygon') {
			return false
		}
		const props = feature.properties as RoomFeature['properties'] | null
		return (
			isBuildingG(props) &&
			typeof props?.Etage === 'string' &&
			INDOOR_ETAGEN.has(props.Etage as FloorId)
		)
	})
}

/** True when the given feature belongs to building G (IN/G). */
export function isIndoorFeature(
	feature:
		| {
				properties?: { Standort?: unknown; Gebaeude?: unknown } | null
		  }
		| null
		| undefined
): boolean {
	return isBuildingG(feature?.properties)
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
			feature.geometry?.type === 'Point' && isBuildingG(feature.properties)
	)

	const entrances = entrancesFc.features.filter(
		(feature): feature is EntranceFeature =>
			feature.geometry?.type === 'Point' && isBuildingG(feature.properties)
	)

	const corridorsByFloor = Object.fromEntries(
		FLOORS.map((floor) => [
			floor,
			corridorFeaturesFromFC({
				type: 'FeatureCollection',
				features: corridorsFc.features.filter(
					(feature) =>
						feature.geometry?.type === 'LineString' &&
						isBuildingG(feature.properties) &&
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
/** Room code → floors where that code exists in building G. */
let cachedRoomFloorsByCode: Map<string, string[]> | null = null

function rebuildRoomFloorsByCode(data: IndoorData): Map<string, string[]> {
	const index = new Map<string, string[]>()
	for (const floor of FLOORS) {
		for (const room of data.roomsByFloor[floor] ?? []) {
			const code = room.properties.Raum
			const floors = index.get(code)
			if (floors == null) {
				index.set(code, [floor])
			} else if (!floors.includes(floor)) {
				floors.push(floor)
			}
		}
	}
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

/** Floors that contain `code` in building G (empty when data is not loaded). */
export function getIndoorRoomFloorsForCode(code: string): string[] {
	return ensureRoomFloorsByCodeIndex()?.get(code) ?? []
}

export function isIndoorDataLoaded(): boolean {
	return cachedData != null
}

export function applyIndoorData(data: IndoorData): void {
	if (cachedData === data) {
		ensureRoomFloorsByCodeIndex()
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
