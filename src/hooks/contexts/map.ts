import { type ClickedMapElement } from '@/types/map'
import { type AvailableRoom } from '@/types/utils'
import { type LocationObject } from 'expo-location'
import { createContext } from 'react'

interface MapContextType {
    localSearch: string
    setLocalSearch: (_: string) => void
    clickedElement: ClickedMapElement | null
    setClickedElement: (_: ClickedMapElement | null) => void
    availableRooms: AvailableRoom[] | null
    setAvailableRooms: (_: AvailableRoom[] | null) => void
    currentFloor: string
    setCurrentFloor: (_: string) => void
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

    currentFloor: '',
    setCurrentFloor: (_: string) => {},

    location: null,
    setLocation: (_: LocationObject | null | 'notGranted') => {},
})
