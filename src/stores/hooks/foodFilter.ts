import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface FoodFilter {
    selectedRestaurants: string[]
    preferencesSelection: string[]
    allergenSelection: string[]
    toggleSelectedRestaurant: (name: string) => void
    toggleSelectedAllergens: (name: string) => void
    toggleSelectedPreferences: (name: string) => void
}

export function useFoodFilter(): FoodFilter {
    const [preferencesSelection, setPreferencesSelection] = useState<string[]>([
        'veg',
        'V',
    ])
    const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([
        'mensa',
    ])
    const [allergenSelection, setAllergenSelection] = useState<string[]>([])

    useEffect(() => {
        void AsyncStorage.getItem('selectedAllergens').then((data) => {
            if (data != null) {
                setAllergenSelection(JSON.parse(data))
            }
        })
        void AsyncStorage.getItem('selectedPreferences').then((data) => {
            if (data != null) {
                setPreferencesSelection(JSON.parse(data))
            }
        })
        void AsyncStorage.getItem('selectedRestaurants').then((data) => {
            if (data != null) {
                setSelectedRestaurants(JSON.parse(data))
            }
        })
    }, [])

    /**
     * Enables or disables a restaurant.
     * @param {string} name Restaurant name (either `mensa` or `reimanns`)
     */
    function toggleSelectedRestaurant(name: string): void {
        const checked = selectedRestaurants.includes(name)
        const newSelection = selectedRestaurants.filter((x) => x !== name)
        if (!checked) {
            newSelection.push(name)
        }

        setSelectedRestaurants(newSelection)
        void AsyncStorage.setItem(
            'selectedRestaurants',
            JSON.stringify(newSelection)
        )
    }

    /**
     * Enables or disables an allergen.
     * @param {string} name Allergen name
     */
    function toggleSelectedAllergens(name: string): void {
        const checked = allergenSelection.includes(name)
        const newSelection = allergenSelection.filter((x) => x !== name)
        if (!checked) {
            newSelection.push(name)
        }

        setAllergenSelection(newSelection)
        void AsyncStorage.setItem(
            'selectedAllergens',
            JSON.stringify(newSelection)
        )
    }
    /**
     * Enables or disables a preference.
     * @param {string} name Preference name
     */
    function toggleSelectedPreferences(name: string): void {
        const checked = preferencesSelection.includes(name)
        const newSelection = preferencesSelection.filter((x) => x !== name)
        if (!checked) {
            newSelection.push(name)
        }

        setPreferencesSelection(newSelection)
        void AsyncStorage.setItem(
            'selectedPreferences',
            JSON.stringify(newSelection)
        )
    }

    return {
        selectedRestaurants,
        preferencesSelection,
        allergenSelection,
        toggleSelectedRestaurant,
        toggleSelectedAllergens,
        toggleSelectedPreferences,
    }
}
