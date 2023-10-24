import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

import packageInfo from '../../../package.json'

export interface FlowHook {
    isOnboarded: boolean | null
    toggleOnboarded: () => void

    isUpdated: boolean | null
    toggleUpdated: () => void
}

/**
 * A custom React hook that provides access to the flow state.
 * @returns An object containing the `isOnboarded`, `toggleOnboarded`, `isUpdated`, and `toggleUpdated` properties.
 */
export function useFlow(): FlowHook {
    const [isOnboarded, setOnboarded] = useState<boolean | null>(null)
    const [isUpdated, setUpdated] = useState<boolean | null>(null)

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const onboarded = await AsyncStorage.getItem('isOnboarded')
                if (onboarded === 'true') {
                    setOnboarded(true)
                } else if (onboarded === null) {
                    setOnboarded(false)
                }
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

    /**
     * Function to toggle the flow state of the app to show the onboarding screen.
     */
    function toggleOnboarded(): void {
        setOnboarded(true)
        void AsyncStorage.setItem('isOnboarded', 'true')
    }

    /**
     * Function to toggle the flow state of the app to show the update screen.
     */
    function toggleUpdated(): void {
        setUpdated(true)
        void AsyncStorage.setItem(`isUpdated-${packageInfo.version}`, 'true')
    }

    return {
        isOnboarded,
        toggleOnboarded,
        isUpdated,
        toggleUpdated,
    }
}
