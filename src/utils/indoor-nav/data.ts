import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { corridorFeaturesFromFC } from './corridor'
import { activeFloors, orderFloors } from './floors'
import { buildIndoorGraph } from './graph-build'
import { entranceNodeId, lowestAssetId } from './ids'
import type {
	DoorFeature,
	EntranceFeature,
	IndoorBuilding,
	IndoorData,
	IndoorGraph,
	RoomFeature
} from './types'

/**
 * Last single-building default (Ingolstadt/G), kept for backwards
 * compatibility. Coverage is discovered from the assets (see below), so new
 * buildings work without touching this file.
 */
export const INDOOR_BUILDING = 'G' as const
export const INDOOR_STANDORT = 'IN' as const

function buildingKey(standort: string, gebaeude: string): string {
	return `${standort}/${gebaeude}`
}

function propsBuilding(
	props: { Standort?: unknown; Gebaeude?: unknown } | null | undefined
): IndoorBuilding | null {
	if (
		props == null ||
		typeof props.Standort !== 'string' ||
		typeof props.Gebaeude !== 'string' ||
		props.Standort.length === 0 ||
		props.Gebaeude.length === 0
	) {
		return null
	}
	return { standort: props.Standort, gebaeude: props.Gebaeude }
}

/**
 * Buildings with indoor routing coverage, derived from the door + corridor
 * ("path") assets. Doors are what connect rooms to the graph, so a building
 * shows up here as soon as its door info lands in the assets — no code
 * change needed for new buildings.
 */
export function coveredBuildingsFromAssets(
	doorsFc: FeatureCollection,
	corridorsFc: FeatureCollection
): IndoorBuilding[] {
	const seen = new Map<string, IndoorBuilding>()
	for (const fc of [doorsFc, corridorsFc]) {
		for (const feature of fc.features ?? []) {
			const building = propsBuilding(feature.properties)
			if (building == null) {
				continue
			}
			const key = buildingKey(building.standort, building.gebaeude)
			if (!seen.has(key)) {
				seen.set(key, building)
			}
		}
	}
	return [...seen.values()].sort(
		(a, b) =>
			a.gebaeude.localeCompare(b.gebaeude, undefined, {
				numeric: true
			}) || a.standort.localeCompare(b.standort)
	)
}

function isCoveredBuilding(
	coveredKeys: Set<string>,
	props: { Standort?: unknown; Gebaeude?: unknown } | null | undefined
): boolean {
	const building = propsBuilding(props)
	if (building == null) {
		return false
	}
	return coveredKeys.has(buildingKey(building.standort, building.gebaeude))
}

/** Abbreviated labels that have no prefixed form (e.g. J uses TRH). */
const FUNKTION_EXACT_ALIASES: Record<string, string> = {
	TRH: 'Treppenhaus'
}

/** Canonical routing labels that may carry a suffix per building. */
const FUNKTION_PREFIX_BASES = ['Flur', 'Treppenhaus', 'Fahrstuhl', 'Atrium']

/**
 * Canonicalize room function labels from the assets. New buildings reuse the
 * known labels with suffixes or abbreviations ('Flur Entrepreneur', 'TRH') —
 * mapping them to the canonical set keeps routing, walk masks and guidance
 * copy working out of the box. Unknown labels pass through untouched.
 */
export function normalizeFunktion(
	funktion: string | undefined
): string | undefined {
	if (funktion == null || funktion === '') {
		return funktion
	}
	const exact = FUNKTION_EXACT_ALIASES[funktion]
	if (exact != null) {
		return exact
	}
	for (const base of FUNKTION_PREFIX_BASES) {
		if (funktion === base || funktion.startsWith(`${base} `)) {
			return base
		}
	}
	return funktion
}

function roomFeaturesFromOverlay(
	overlay: FeatureCollection,
	coveredKeys: Set<string>
): RoomFeature[] {
	return overlay.features.flatMap((feature): RoomFeature[] => {
		if (feature.geometry?.type !== 'Polygon') {
			return []
		}
		const props = feature.properties as RoomFeature['properties'] | null
		if (
			!isCoveredBuilding(coveredKeys, props) ||
			typeof props?.Etage !== 'string' ||
			props.Etage.length === 0
		) {
			return []
		}
		const funktion = normalizeFunktion(props.Funktion_de)
		if (funktion === props.Funktion_de) {
			return [feature as RoomFeature]
		}
		return [
			{
				...feature,
				properties: { ...props, Funktion_de: funktion }
			} as RoomFeature
		]
	})
}

/**
 * True when the given feature belongs to a building with indoor routing
 * coverage. Reads the loaded dataset, so any building from the door/path
 * assets matches out of the box.
 */
export function isIndoorFeature(
	feature:
		| {
				properties?: { Standort?: unknown; Gebaeude?: unknown } | null
		  }
		| null
		| undefined
): boolean {
	const building = propsBuilding(feature?.properties)
	if (building == null) {
		return false
	}
	return coveredBuildingKeys().has(
		buildingKey(building.standort, building.gebaeude)
	)
}

export function buildIndoorDataFromGeoJson(
	roomsOverlay: FeatureCollection,
	doorsFc: FeatureCollection,
	entrancesFc: FeatureCollection,
	corridorsFc: FeatureCollection
): IndoorData {
	const buildings = coveredBuildingsFromAssets(doorsFc, corridorsFc)
	const coveredKeys = new Set(
		buildings.map((b) => buildingKey(b.standort, b.gebaeude))
	)

	const roomsByFloor: Record<string, RoomFeature[]> = {}
	for (const room of roomFeaturesFromOverlay(roomsOverlay, coveredKeys)) {
		const floor = String(room.properties.Etage)
		const bucket = roomsByFloor[floor]
		if (bucket == null) {
			roomsByFloor[floor] = [room]
		} else {
			bucket.push(room)
		}
	}
	const floors = orderFloors(Object.keys(roomsByFloor))

	const doors = doorsFc.features.filter(
		(feature): feature is DoorFeature =>
			feature.geometry?.type === 'Point' &&
			isCoveredBuilding(coveredKeys, feature.properties)
	)

	const entrances = entrancesFc.features.filter(
		(feature): feature is EntranceFeature =>
			feature.geometry?.type === 'Point' &&
			isCoveredBuilding(coveredKeys, feature.properties)
	)

	const corridorsByFloor: Record<
		string,
		ReturnType<typeof corridorFeaturesFromFC>
	> = {}
	for (const floor of floors) {
		corridorsByFloor[floor] = corridorFeaturesFromFC({
			type: 'FeatureCollection',
			features: corridorsFc.features.filter(
				(feature) =>
					feature.geometry?.type === 'LineString' &&
					isCoveredBuilding(coveredKeys, feature.properties) &&
					String(feature.properties?.Etage) === floor
			)
		})
	}

	return {
		buildings,
		floors,
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
	return activeFloors(cachedData?.floors ?? [])
}

let cachedData: IndoorData | null = null
let cachedGraph: IndoorGraph | null = null
/** Room code → floors where that code exists (bottom-up). */
let cachedRoomFloorsByCode: Map<string, string[]> | null = null
/** Room code → its building. Room codes are unique per building. */
let cachedBuildingByCode: Map<string, IndoorBuilding> | null = null

function rebuildRoomIndexes(data: IndoorData): {
	roomFloorsByCode: Map<string, string[]>
	buildingByCode: Map<string, IndoorBuilding>
} {
	const roomFloorsByCode = new Map<string, string[]>()
	const buildingByCode = new Map<string, IndoorBuilding>()
	for (const floor of data.floors) {
		for (const room of data.roomsByFloor[floor] ?? []) {
			const code = room.properties.Raum
			const building = propsBuilding(room.properties)
			if (building != null && !buildingByCode.has(code)) {
				buildingByCode.set(code, building)
			}
			const floors = roomFloorsByCode.get(code)
			if (floors == null) {
				roomFloorsByCode.set(code, [floor])
			} else if (!floors.includes(floor)) {
				floors.push(floor)
			}
		}
	}
	return { roomFloorsByCode, buildingByCode }
}

function ensureRoomIndexes(): {
	roomFloorsByCode: Map<string, string[]>
	buildingByCode: Map<string, IndoorBuilding>
} | null {
	if (cachedRoomFloorsByCode != null && cachedBuildingByCode != null) {
		return {
			roomFloorsByCode: cachedRoomFloorsByCode,
			buildingByCode: cachedBuildingByCode
		}
	}
	if (cachedData == null) {
		return null
	}
	const indexes = rebuildRoomIndexes(cachedData)
	cachedRoomFloorsByCode = indexes.roomFloorsByCode
	cachedBuildingByCode = indexes.buildingByCode
	return indexes
}

/** Floors that contain `code` (empty when data is not loaded). */
export function getIndoorRoomFloorsForCode(code: string): string[] {
	return ensureRoomIndexes()?.roomFloorsByCode.get(code) ?? []
}

/** Building a room code belongs to (null when unknown / not loaded). */
export function getIndoorBuildingForCode(code: string): IndoorBuilding | null {
	return ensureRoomIndexes()?.buildingByCode.get(code) ?? null
}

/** Covered buildings of the loaded dataset (empty when not loaded). */
export function indoorBuildings(): IndoorBuilding[] {
	return cachedData != null ? [...cachedData.buildings] : []
}

function coveredBuildingKeys(): Set<string> {
	return new Set(
		(cachedData?.buildings ?? []).map((b) =>
			buildingKey(b.standort, b.gebaeude)
		)
	)
}

/**
 * Default route start for a building: its lowest-numbered entrance
 * (numeric-aware, so E2 beats E10). New buildings pick this up automatically
 * as soon as their entrances are in the assets.
 */
export function getIndoorDefaultStartIdForBuilding(
	standort: string,
	gebaeude: string
): string | undefined {
	const key = buildingKey(standort, gebaeude)
	const ids = (cachedData?.entrances ?? [])
		.filter(
			(entrance) =>
				entrance.geometry?.type === 'Point' &&
				typeof entrance.properties?.id === 'string' &&
				entrance.properties.id.length > 0 &&
				buildingKey(
					String(entrance.properties.Standort),
					String(entrance.properties.Gebaeude)
				) === key
		)
		.map((entrance) => entrance.properties.id)
	const lowest = lowestAssetId(ids)
	return lowest == null ? undefined : entranceNodeId(lowest)
}

/** Default route start for a room code (its building's lowest entrance). */
export function getIndoorDefaultStartIdForCode(
	code: string
): string | undefined {
	const building = getIndoorBuildingForCode(code)
	if (building == null) {
		return undefined
	}
	return getIndoorDefaultStartIdForBuilding(
		building.standort,
		building.gebaeude
	)
}

export function isIndoorDataLoaded(): boolean {
	return cachedData != null
}

export function applyIndoorData(data: IndoorData): void {
	if (cachedData === data) {
		ensureRoomIndexes()
		return
	}
	cachedData = data
	cachedGraph = null
	const indexes = rebuildRoomIndexes(data)
	cachedRoomFloorsByCode = indexes.roomFloorsByCode
	cachedBuildingByCode = indexes.buildingByCode
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
