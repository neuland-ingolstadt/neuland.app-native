import { type LanguageKey } from '@/localization/i18n'
import { storage } from '@/utils/storage'
import { useEffect, useState } from 'react'
import { useMMKVBoolean } from 'react-native-mmkv'

export type FoodLanguage = LanguageKey | 'default'
export interface FoodFilter {
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
}

export function useFoodFilter(): FoodFilter {
    const [preferencesSelection, setPreferencesSelection] = useState<string[]>([
        'veg',
        'V',
    ])
    const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([
        'IngolstadtMensa',
        'Reimanns',
    ])
    const [allergenSelection, setAllergenSelection] = useState<string[]>([
        'not-configured',
    ])
    const [showStatic, setShowStatic] = useMMKVBoolean('showStatic')
    const [foodLanguage, setFoodLanguage] = useState<FoodLanguage>('default')

    useEffect(() => {
        const allergensData = storage.getString('selectedUserAllergens')
        const preferencesData = storage.getString('selectedUserPreferences')
        const restaurantsData = storage.getString('selectedRestaurantLocations')
        const foodLanguageData = storage.getString('foodLanguage')

        if (allergensData != null) {
            setAllergenSelection(JSON.parse(allergensData) as string[])
        } else {
            setAllergenSelection(['not-configured'])
        }
        if (preferencesData != null) {
            setPreferencesSelection(JSON.parse(preferencesData) as string[])
        }
        if (restaurantsData != null) {
            setSelectedRestaurants(JSON.parse(restaurantsData) as string[])
        }

        if (foodLanguageData != null) {
            setFoodLanguage(foodLanguageData as FoodLanguage)
        } else {
            setFoodLanguage('default')
        }
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
        storage.set('selectedRestaurantLocations', JSON.stringify(newSelection))
    }

    /**
     * Enables or disables an allergen.
     * @param {string} name Allergen name
     */
    function toggleSelectedAllergens(name: string): void {
        const checked = allergenSelection.includes(name)
        let newSelection = allergenSelection.filter((x) => x !== name)
        if (!checked) {
            newSelection.push(name)
        }

        // If "not-configured" is in the selection, remove it
        if (newSelection.includes('not-configured')) {
            newSelection = newSelection.filter((x) => x !== 'not-configured')
        }

        setAllergenSelection(newSelection)
        storage.set('selectedUserAllergens', JSON.stringify(newSelection))
    }

    /**
     * Initializes the allergen selection.
     */

    function initAllergenSelection(): void {
        setAllergenSelection([])
        storage.set('selectedUserAllergens', JSON.stringify([]))
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
        storage.set('selectedUserPreferences', JSON.stringify(newSelection))
    }

    /**
     * Updates the language used for the food.
     * @param {FoodLanguage} language
     * @returns {void}
     * @memberof FoodFilter
     */
    function toggleFoodLanguage(language: string): void {
        setFoodLanguage(language as FoodLanguage)
        storage.set('foodLanguage', language)
    }

    return {
        selectedRestaurants,
        preferencesSelection,
        allergenSelection,
        showStatic,
        foodLanguage,
        toggleSelectedRestaurant,
        toggleSelectedAllergens,
        initAllergenSelection,
        toggleSelectedPreferences,
        setShowStatic,
        toggleFoodLanguage,
    }
}
