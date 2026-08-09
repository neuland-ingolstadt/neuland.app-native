import type { Feature, GeoJsonProperties } from 'geojson'

import type { AvailableRoom } from './utils'

export type MapCoordinate = [number, number]

export enum SEARCH_TYPES {
	BUILDING = 0,
	ROOM = 1,
	LECTURE = 2
}
export interface RoomData {
	title: string
	subtitle: string
	properties: GeoJsonProperties | undefined
	occupancies: AvailableRoom | BuildingOccupancy | null
	nextAvailable?: AvailableRoom | null
	type: SEARCH_TYPES
}

export interface BuildingOccupancy {
	total: number
	available: number
}
export interface ClickedMapElement {
	type: SEARCH_TYPES
	data: string
	center?: MapCoordinate
	manual?: boolean
}

export interface SearchResult {
	title: string
	subtitle: string
	isExactMatch?: boolean
	item: Feature
}
