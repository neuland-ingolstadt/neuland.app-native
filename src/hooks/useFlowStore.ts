import * as Application from 'expo-application'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { zustandStorage } from '@/utils/storage'

interface FlowStore {
	isOnboarded: boolean | undefined
	setOnboarded: () => void

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
			setOnboarded: () => {
				set({ isOnboarded: true })
			},

			updatedVersion: undefined,
			toggleUpdated: () => {
				set(() => ({
					updatedVersion: convertToMajorMinorPatch(version)
				}))
			},

			analyticsAllowed: undefined,
			setAnalyticsAllowed: (value: boolean) => {
				set({ analyticsAllowed: value })
			}
		}),
		{
			name: 'flow-store',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
