import { type ClickedMapElement } from '@/types/map'
import { type AvailableRoom, type FriendlyTimetableEntry } from '@/types/utils'
import { type LocationObject } from 'expo-location'
import { createContext } from 'react'

interface MapContextType {
    localSearch: string
    setLocalSearch: (_: string) => void
    clickedElement: ClickedMapElement | null
    setClickedElement: (_: ClickedMapElement | null) => void
    availableRooms: AvailableRoom[] | null
    setAvailableRooms: (_: AvailableRoom[] | null) => void
    nextLecture: FriendlyTimetableEntry[] | null
    setNextLecture: (_: FriendlyTimetableEntry[] | null) => void
    currentFloor: { floor: string; manual: boolean } | null
    setCurrentFloor: (_: { floor: string; manual: boolean }) => void
    location: LocationObject | null | 'notGranted'
    setLocation: (_: LocationObject | null | 'notGranted') => void
}

export const MapContext = createContext<MapContextType>({
    localSearch: '',
    setLocalSearch: (_: string) => {},

    clickedElement: null,
    setClickedElement: (_: ClickedMapElement | null) => {},

    availableRooms: null,
    setAvailableRooms: (_: AvailableRoom[] | null) => {},

    currentFloor: null,
    setCurrentFloor: (_: { floor: string; manual: boolean }) => {},

    location: null,
    setLocation: (_: LocationObject | null | 'notGranted') => {},

    nextLecture: null,
    setNextLecture: (_: FriendlyTimetableEntry[] | null) => {},
})
