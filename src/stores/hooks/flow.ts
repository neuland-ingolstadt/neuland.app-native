import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface FlowHook {
    isOnboarded: boolean | null
    toggleOnboarded: () => void

    isUpdated: boolean | null
    toggleUpdated: () => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with mobilityKind and togglemobilityKind properties.
 */
export function useFlow(): FlowHook {
    const [isOnboarded, setOnboarded] = useState<boolean | null>(null)
    const [isUpdated, setUpdated] = useState<boolean | null>(null)

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const onboarded = await AsyncStorage.getItem('isssOnboarded')
                if (onboarded === 'true') {
                    setOnboarded(true)
                } else if (onboarded === null) {
                    setOnboarded(false)
                }
                console.log('onboarded')

                const updated = await AsyncStorage.getItem('isUpdated')
                if (updated === 'true') {
                    setUpdated(true)
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

    function toggleOnboarded(): void {
        setOnboarded(true)

        void AsyncStorage.setItem('isssOnboarded', 'true')
        console.log('onboarded set')
    }

    function toggleUpdated(): void {
        console.log('updated set')
        setUpdated(true)

        void AsyncStorage.setItem('isUpdated', 'true')
    }

    return {
        isOnboarded,
        toggleOnboarded,
        isUpdated,
        toggleUpdated,
    }
}
