import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { useState } from 'react'
import { useMMKVBoolean } from 'react-native-mmkv'

import packageInfo from '../../package.json'

export interface FlowHook {
    isOnboarded: boolean | undefined
    setOnboarded: (value: boolean) => void

    isUpdated: boolean | undefined
    setUpdated: (value: boolean) => void

    analyticsAllowed: boolean | undefined
    setAnalyticsAllowed: (value: boolean) => void

    analyticsInitialized: boolean
    initializeAnalytics: () => void
}

/**
 * A custom React hook that provides access to the flow state.
 * @returns An object containing the flow state and functions to update it.
 */
export function useFlow(): FlowHook {
    const [isOnboarded, setOnboarded] = useMMKVBoolean('isOnboardedv1')
    const [isUpdated, setUpdated] = useMMKVBoolean(
        `isUpdated-${convertToMajorMinorPatch(packageInfo.version)}`
    )
    const [analyticsAllowed, setAnalyticsAllowed] = useMMKVBoolean('analytics')
    const [analyticsInitialized, setAnalyticsInitialized] =
        useState<boolean>(false)

    /**
     * Function to initialize analytics.
     * This state is not stored in MMKV, as it is only valid for the current session.
     * It is used to correctly enable and trigger the events on app start in provider.tsx.
     */
    function initializeAnalytics(): void {
        if (analyticsAllowed === true && !analyticsInitialized) {
            setAnalyticsInitialized(true)
        }
    }

    return {
        isOnboarded,
        setOnboarded,
        isUpdated,
        setUpdated,
        analyticsAllowed,
        setAnalyticsAllowed,
        analyticsInitialized,
        initializeAnalytics,
    }
}
