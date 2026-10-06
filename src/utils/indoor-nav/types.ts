import type { CorridorFeature, CorridorNet } from './corridor'
import type { WalkMask } from './walkable'

export type FloorId = 'EG' | '1' | '2' | '3'

export type RoomFeature = GeoJSON.Feature<
	GeoJSON.Polygon | GeoJSON.MultiPolygon,
	RoomProps
>
export type DoorFeature = GeoJSON.Feature<GeoJSON.Point, DoorProps>
export type EntranceFeature = GeoJSON.Feature<GeoJSON.Point, EntranceProps>

/** A campus building with indoor routing coverage (door + path assets). */
export interface IndoorBuilding {
	standort: string
	gebaeude: string
}

export interface IndoorData {
	/** Covered buildings, sorted by building code (numeric-aware). */
	buildings: IndoorBuilding[]
	/** Union of room floors across covered buildings, ordered bottom-up. */
	floors: string[]
	roomsByFloor: Record<string, RoomFeature[]>
	doors: DoorFeature[]
	entrances: EntranceFeature[]
	corridorsByFloor: Record<string, CorridorFeature[]>
}

export interface IndoorGraph {
	nodes: Map<string, GraphNode>
	edges: Map<string, GraphEdge[]>
	roomsIndex: Map<string, RoomFeature>
	circulation: Record<string, WalkMask[]>
	corridors: Record<string, CorridorNet | null>
	roomNodeId: (floor: string, raum: string) => string
}

export interface RoomProps {
	Standort: string
	Gebaeude: string
	Etage: FloorId | string
	Ebene?: string
	Raum: string
	Funktion_de?: string
	Funktion_en?: string
}

export interface DoorProps {
	id: string
	Standort: string
	Gebaeude: string
	Etage: FloorId | string
	Raum: string
	Flur: string
	Funktion_de?: string
	kind?: string
	role?: string
	display?: string
}

export interface EntranceProps {
	id: string
	Standort: string
	Gebaeude: string
	Etage: FloorId | string
	name_de?: string
	name_en?: string
	kind?: string
	access?: string
}

export type LonLat = [number, number]

/** Frame the camera on these corners (shared by native + web canvases). */
export interface FitBounds {
	northEast: LonLat
	southWest: LonLat
}

export type GraphNodeKind = 'room' | 'door' | 'entrance' | 'portal'

export interface GraphNode {
	id: string
	kind: GraphNodeKind
	floor: FloorId | string
	coord: LonLat
	label?: string
	roomCode?: string
	viaDoor?: boolean
}

export interface GraphEdge {
	from: string
	to: string
	weight: number
	kind: 'via_door' | 'corridor' | 'stair_corridor' | 'vertical' | 'entrance'
	viaDoorId?: string
}

export interface FloorSegment {
	floor: string
	coords: LonLat[]
	distanceM: number
	durationSec: number
	label?: string
	startNodeId?: string
	endNodeId?: string
}

export interface FloorChange {
	fromFloor: string
	toFloor: string
	at: LonLat
	viaFrom: string
	viaTo: string
	fromStairCode?: string
	toStairCode?: string
	distanceM: number
	durationSec: number
}

export interface RouteResult {
	nodeIds: string[]
	coords: LonLat[]
	floors: string[]
	distanceM: number
	durationSec: number
	hops: Array<{ from: string; to: string; kind: GraphEdge['kind'] }>
	segments: FloorSegment[]
	floorChanges: FloorChange[]
}
