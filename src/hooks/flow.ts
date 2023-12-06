import { convertToMajorMinorPatch } from '@/utils/app-utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

import packageInfo from '../../package.json'

export interface FlowHook {
    isOnboarded: boolean | null
    toggleOnboarded: () => void

    isUpdated: boolean | null
    toggleUpdated: () => void

    analyticsAllowed: boolean | null
    toggleAnalytics: () => void

    analyticsInitialized: boolean
    initializeAnalytics: () => void
}

/**
 * A custom React hook that provides access to the flow state.
 * @returns An object containing the `isOnboarded`, `toggleOnboarded`, `isUpdated`, and `toggleUpdated` properties.
 */
export function useFlow(): FlowHook {
    const [isOnboarded, setOnboarded] = useState<boolean | null>(null)
    const [isUpdated, setUpdated] = useState<boolean | null>(null)
    const [analyticsAllowed, setAnalyticsAllowed] = useState<boolean>(false)
    const [analyticsInitialized, setAnalyticsInitialized] =
        useState<boolean>(false)
    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const [onboardedKey, updatedKey, analyticsKey] =
                    await Promise.all([
                        AsyncStorage.getItem('isOnboarded'),
                        AsyncStorage.getItem(
                            `isUpdated-${convertToMajorMinorPatch(
                                packageInfo.version
                            )}`
                        ),
                        AsyncStorage.getItem('analytics'),
                    ])

                if (onboardedKey === 'true') {
                    setOnboarded(true)
                } else if (onboardedKey === null) {
                    setOnboarded(false)
                }

                if (updatedKey === 'true') {
                    setUpdated(true)
                } else if (updatedKey === null) {
                    setUpdated(false)
                }

                if (
                    analyticsKey === 'true' ||
                    (analyticsKey === null && onboardedKey === 'true')
                ) {
                    setAnalyticsAllowed(true)
                } else if (analyticsKey === 'false') {
                    setAnalyticsAllowed(false)
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
        void AsyncStorage.setItem(
            `isUpdated-${convertToMajorMinorPatch(packageInfo.version)}`,
            'true'
        )
    }

    /**
     * Function to toggle the flow state of the app to disable analytics.
     */
    function toggleAnalytics(): void {
        if (analyticsAllowed) {
            setAnalyticsAllowed(false)
            void AsyncStorage.setItem('analytics', 'false')
        } else {
            setAnalyticsAllowed(true)
            void AsyncStorage.setItem('analytics', 'true')
        }
    }

    /**
     * Function to initialize analytics.
     */
    function initializeAnalytics(): void {
        if (analyticsAllowed && !analyticsInitialized) {
            void AsyncStorage.setItem('analytics', 'true')
            setAnalyticsInitialized(true)
        }
    }

    return {
        isOnboarded,
        toggleOnboarded,
        isUpdated,
        toggleUpdated,
        analyticsAllowed,
        toggleAnalytics,
        analyticsInitialized,
        initializeAnalytics,
    }
}
