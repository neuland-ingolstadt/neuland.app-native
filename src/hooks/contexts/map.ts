import { type ClickedMapElement } from '@/types/map'
import { type AvailableRoom } from '@/types/utils'
import { type LocationObject } from 'expo-location'
import { createContext } from 'react'

interface MapContextType {
    localSearch: string
    setLocalSearch: (_: string) => void
    clickedElement: ClickedMapElement | null
    setClickedElement: (_: ClickedMapElement | null) => void
    availableRooms: AvailableRoom[]
    setAvailableRooms: (_: AvailableRoom[]) => void
    currentFloor: string
    setCurrentFloor: (_: string) => void
    location: LocationObject | null
    setLocation: (_: LocationObject | null) => void
}

export const MapContext = createContext<MapContextType>({
    localSearch: '',
    setLocalSearch: (_: string) => {},

    clickedElement: null,
    setClickedElement: (_: ClickedMapElement | null) => {},

    availableRooms: [],
    setAvailableRooms: (_: AvailableRoom[]) => {},

    currentFloor: '',
    setCurrentFloor: (_: string) => {},

    location: null,
    setLocation: (_: LocationObject | null) => {},
})
