import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export type FoodLanguage = 'en' | 'de' | 'default'

export interface FoodFilter {
    selectedRestaurants: string[]
    preferencesSelection: string[]
    allergenSelection: string[]
    showStatic: boolean
    foodLanguage: FoodLanguage
    toggleSelectedRestaurant: (name: string) => void
    toggleSelectedAllergens: (name: string) => void
    toggleSelectedPreferences: (name: string) => void
    toggleShowStatic: () => void
    toggleFoodLanguage: (language: FoodLanguage) => void
}

export function useFoodFilter(): FoodFilter {
    const [preferencesSelection, setPreferencesSelection] = useState<string[]>([
        'veg',
        'V',
    ])
    const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([
        'mensa',
        'reimanns',
    ])
    const [allergenSelection, setAllergenSelection] = useState<string[]>([])
    const [showStatic, setShowStatic] = useState<boolean>(false)
    const [foodLanguage, setFoodLanguage] = useState<FoodLanguage>('default')

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
        void AsyncStorage.getItem('showStatic').then((data) => {
            if (data != null) {
                setShowStatic(JSON.parse(data))
            }
        })

        void AsyncStorage.getItem('foodLanguage').then((data) => {
            if (data != null) {
                setFoodLanguage(JSON.parse(data))
            } else {
                setFoodLanguage('default')
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

    /**
     * Enables or disables the static food.
     * @param {boolean} value
     */
    function toggleShowStatic(): void {
        const newSelection = !showStatic
        setShowStatic(newSelection)
        void AsyncStorage.setItem('showStatic', JSON.stringify(newSelection))
    }

    /**
     * Updates the language used for the food.
     * @param {LanguageKey} language
     * @returns {void}
     * @memberof FoodFilter
     */
    function toggleFoodLanguage(language: 'en' | 'de' | 'default'): void {
        setFoodLanguage(language)
        void AsyncStorage.setItem('foodLanguage', JSON.stringify(language))
    }

    return {
        selectedRestaurants,
        preferencesSelection,
        allergenSelection,
        showStatic,
        foodLanguage,
        toggleSelectedRestaurant,
        toggleSelectedAllergens,
        toggleSelectedPreferences,
        toggleShowStatic,
        toggleFoodLanguage,
    }
}
