import type { LanguageKey } from '@/localization/i18n'
import { zustandStorage } from '@/utils/storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type FoodLanguage = LanguageKey | 'default'

interface FoodFilterStore {
	selectedRestaurants: string[]
	preferencesSelection: string[]
	allergenSelection: string[]
	showStatic: boolean | undefined
	foodLanguage: FoodLanguage
	toggleSelectedRestaurant: (name: string) => void
	toggleSelectedAllergens: (name: string) => void
	initAllergenSelection: () => void
	toggleSelectedPreferences: (name: string) => void
	setShowStatic: (value: boolean) => void
	toggleFoodLanguage: (language: string) => void
	reset: () => void
}

const initialState: Omit<
	FoodFilterStore,
	| 'toggleSelectedRestaurant'
	| 'toggleSelectedAllergens'
	| 'initAllergenSelection'
	| 'toggleSelectedPreferences'
	| 'setShowStatic'
	| 'toggleFoodLanguage'
	| 'reset'
> = {
	selectedRestaurants: ['IngolstadtMensa', 'Reimanns'],
	preferencesSelection: ['veg', 'V'],
	allergenSelection: ['not-configured'],
	showStatic: undefined,
	foodLanguage: 'default'
}

export const useFoodFilterStore = create<FoodFilterStore>()(
	persist(
		(set) => ({
			...initialState,
			toggleSelectedRestaurant: (name: string) => {
				set((state) => {
					const checked = state.selectedRestaurants.includes(name)
					const newSelection = state.selectedRestaurants.filter(
						(x) => x !== name
					)
					if (!checked) {
						newSelection.push(name)
					}
					return { selectedRestaurants: newSelection }
				})
			},
			toggleSelectedAllergens: (name: string) => {
				set((state) => {
					const checked = state.allergenSelection.includes(name)
					let newSelection = state.allergenSelection.filter((x) => x !== name)
					if (!checked) {
						newSelection.push(name)
					}
					if (newSelection.includes('not-configured')) {
						newSelection = newSelection.filter((x) => x !== 'not-configured')
					}

					return { allergenSelection: newSelection }
				})
			},
			initAllergenSelection: () => {
				set({ allergenSelection: [] })
			},
			toggleSelectedPreferences: (name: string) => {
				set((state) => {
					const checked = state.preferencesSelection.includes(name)
					const newSelection = state.preferencesSelection.filter(
						(x) => x !== name
					)
					if (!checked) {
						newSelection.push(name)
					}

					return { preferencesSelection: newSelection }
				})
			},
			setShowStatic: (value: boolean) => {
				set({ showStatic: value })
			},
			toggleFoodLanguage: (language: string) => {
				set({ foodLanguage: language as FoodLanguage })
			},
			reset: () => {
				set({ ...initialState })
				zustandStorage.removeItem('food-filter-store')
			}
		}),
		{
			name: 'food-filter-storage',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
