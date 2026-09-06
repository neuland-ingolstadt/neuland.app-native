import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

interface ServiceStatusStore {
	dismissedSignature: string | null
	dismiss: (signature: string) => void
	reset: () => void
}

const initialState = {
	dismissedSignature: null as string | null
}

export const useServiceStatusStore = create<ServiceStatusStore>()(
	persist(
		(set) => ({
			...initialState,
			dismiss: (signature: string) => set({ dismissedSignature: signature }),
			reset: () => set(initialState)
		}),
		{
			name: 'service-status-store',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
