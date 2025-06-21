import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

interface ClubsStore {
	followedClubs: string[]
	toggleClub: (name: string) => void
	reset: () => void
}

const initialState: Omit<ClubsStore, 'toggleClub' | 'reset'> = {
	followedClubs: []
}

export const useClubsStore = create<ClubsStore>()(
	persist(
		(set) => ({
			...initialState,
			toggleClub: (name: string) => {
				set((state) => {
					const checked = state.followedClubs.includes(name)
					const newSelection = state.followedClubs.filter((x) => x !== name)
					if (!checked) {
						newSelection.push(name)
					}
					return { followedClubs: newSelection }
				})
			},
			reset: () => {
				set({ ...initialState })
				zustandStorage.removeItem('clubs-storage')
			}
		}),
		{
			name: 'clubs-storage',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
