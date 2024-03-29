import { type AvailableRoom, type RoomEntry } from './utils'

export enum SEARCH_TYPES {
    BUILDING,
    ROOM,
    LECTURE,
}
export interface RoomData {
    title: string
    subtitle: string
    properties: RoomEntry['properties'] | null
    occupancies: (AvailableRoom | null) | BuildingOccupancy
    type: SEARCH_TYPES
}

export interface BuildingOccupancy {
    total: number
    available: number
}
export interface ClickedMapElement {
    type: SEARCH_TYPES
    data: string
}

export interface searchResult {
    type: SEARCH_TYPES
    highlight: RoomEntry[]
    title: string
    subtitle: string
    center: number[]
}

export interface SearchResult {
    title: string
    subtitle: string
    isExactMatch?: boolean
    item: RoomEntry
}
