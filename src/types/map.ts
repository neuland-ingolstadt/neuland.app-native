import { type Feature, type GeoJsonProperties, type Position } from 'geojson'

import { type AvailableRoom } from './utils'

export enum SEARCH_TYPES {
    BUILDING,
    ROOM,
    LECTURE,
}
export interface RoomData {
    title: string
    subtitle: string
    properties: GeoJsonProperties | undefined
    occupancies: AvailableRoom | BuildingOccupancy | null
    type: SEARCH_TYPES
}

export interface BuildingOccupancy {
    total: number
    available: number
}
export interface ClickedMapElement {
    type: SEARCH_TYPES
    data: string
    center?: Position
    manual?: boolean
}

export interface SearchResult {
    title: string
    subtitle: string
    isExactMatch?: boolean
    item: Feature
}
