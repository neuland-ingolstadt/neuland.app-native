import { convertToMajorMinorPatch } from '@/utils/app-utils'
import * as Application from 'expo-application'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from './mmkv'

interface FlowStore {
    isOnboarded: boolean | undefined
    setOnboarded: (value: boolean) => void

    updatedVersion: string | undefined
    toggleUpdated: () => void

    analyticsAllowed: boolean | undefined
    setAnalyticsAllowed: (value: boolean) => void
}

const version = Application.nativeApplicationVersion ?? '0.0.0'

export const useFlowStore = create<FlowStore>()(
    persist(
        (set) => ({
            isOnboarded: undefined,
            setOnboarded: (value: boolean) => {
                set({ isOnboarded: value })
            },

            updatedVersion: undefined,
            toggleUpdated: () => {
                set(() => ({
                    updatedVersion: convertToMajorMinorPatch(version),
                }))
            },

            analyticsAllowed: undefined,
            setAnalyticsAllowed: (value: boolean) => {
                set({ analyticsAllowed: value })
            },
        }),
        {
            name: `flow-store`,
            storage: createJSONStorage(() => zustandStorage),
        }
    )
)
