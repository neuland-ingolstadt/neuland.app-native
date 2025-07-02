import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

interface RueWarningStore {
	dismissedEventId: string | null
	dismiss: (eventId: string | null) => void
	reset: () => void
}

const initialState = {
	dismissedEventId: null
}

export const useRueWarningStore = create<RueWarningStore>()(
	persist(
		(set) => ({
			...initialState,
			dismiss: (eventId: string | null) => set({ dismissedEventId: eventId }),
			reset: () => set(initialState)
		}),
		{
			name: 'rue-warning-store',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
