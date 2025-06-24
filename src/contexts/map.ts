import { createContext } from 'react'
import type { ClickedMapElement, SearchResult } from '@/types/map'
import type { AvailableRoom, FriendlyTimetableEntry } from '@/types/utils'
import type { RoomOpenings } from '@/utils/map-utils'

interface MapContextType {
	localSearch: string
	setLocalSearch: (value: string) => void
	clickedElement: ClickedMapElement | null
	setClickedElement: (value: ClickedMapElement | null) => void
	availableRooms: AvailableRoom[] | null
	setAvailableRooms: (value: AvailableRoom[] | null) => void
	roomOpenings: RoomOpenings | null
	setRoomOpenings: (value: RoomOpenings | null) => void
	nextLecture: FriendlyTimetableEntry[] | null
	setNextLecture: (value: FriendlyTimetableEntry[] | null) => void
	currentFloor: { floor: string; manual: boolean } | null
	setCurrentFloor: (value: { floor: string; manual: boolean }) => void
	searchHistory: SearchResult[]
	updateSearchHistory: (value: SearchResult[]) => void
}

export const MapContext = createContext<MapContextType>({
	localSearch: '',
	setLocalSearch: () => {
		throw new Error('setLocalSearch must be overridden')
	},

	clickedElement: null,
	setClickedElement: () => {
		throw new Error('setClickedElement must be overridden')
	},

	availableRooms: null,
	setAvailableRooms: () => {
		throw new Error('setAvailableRooms must be overridden')
	},
	roomOpenings: null,
	setRoomOpenings: () => {
		throw new Error('setRoomOpenings must be overridden')
	},

	currentFloor: null,
	setCurrentFloor: () => {
		throw new Error('setCurrentFloor must be overridden')
	},

	nextLecture: null,
	setNextLecture: () => {
		throw new Error('setNextLecture must be overridden')
	},

	searchHistory: [],
	updateSearchHistory: () => {
		throw new Error('updateSearchHistory must be overridden')
	}
})
