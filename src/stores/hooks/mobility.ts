import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface MobilityHook {
    mobilityKind: string
    mobilityStation: string
    toggleMobilityKind: (name: string) => void
    toggleMobilityStation: (name: string) => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with mobilityKind and togglemobilityKind properties.
 */
export function useMobility(): MobilityHook {
    const [mobilityKind, setMobilityKind] = useState<string>('bus')
    const [mobilityStation, setMobilityStation] = useState<string>('Hochschule')

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const kind = await AsyncStorage.getItem('mobilityKind')
                if (kind != null) {
                    setMobilityKind(kind)
                }
                const station = await AsyncStorage.getItem('mobilityStation')
                if (station != null) {
                    setMobilityKind(station)
                }
            } catch (error) {
                console.error(
                    'Error while retrieving data from AsyncStorage:',
                    error
                )
            }
        }
        void loadAsyncStorageData()
    }, [])

    /**
     * Function to toggle the accent color of the app.
     * @param name - The name of the new accent color.
     */
    function toggleMobilityKind(name: string): void {
        setMobilityKind(name)

        void AsyncStorage.setItem('mobilityKind', name)
    }

    function toggleMobilityStation(name: string): void {
        setMobilityStation(name)

        void AsyncStorage.setItem('mobilityStation', name)
    }

    return {
        mobilityKind,
        mobilityStation,
        toggleMobilityStation,
        toggleMobilityKind,
    }
}
