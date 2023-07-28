import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface FoodFilter {
    accentColor: string
    toggleAccentColor: (name: string) => void
    theme: string
    toggleTheme: (name: 'light' | 'dark' | 'system') => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the theme and accent color across app sessions.
 * @returns FoodFilter object with accentColor, toggleAccentColor, theme, and toggleTheme properties.
 */
export function useThemeHook(): FoodFilter {
    const [accentColor, setAccentColor] = useState<string>('teal')
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

    useEffect(() => {
        void AsyncStorage.getItem('accentColor').then((data) => {
            if (data != null) {
                setAccentColor(data)
            }
        })

        // Load theme from AsyncStorage
        void AsyncStorage.getItem('theme').then((data) => {
            if (data != null) {
                setTheme(data as 'light' | 'dark' | 'system')
            }
        })
    }, [])

    /**
     * Function to toggle the accent color of the app.
     * @param name - The name of the new accent color.
     */
    function toggleAccentColor(name: string): void {
        setAccentColor(name)

        // Save new accent color to AsyncStorage
        void AsyncStorage.setItem('accentColor', name)
    }

    /**
     * Function to toggle the theme of the app.
     * @param name - The name of the new theme ('light', 'dark', or 'system').
     */
    function toggleTheme(name: 'light' | 'dark' | 'system'): void {
        setTheme(name)

        // Save new theme to AsyncStorage
        void AsyncStorage.setItem('theme', name)
    }

    return {
        accentColor,
        toggleAccentColor,
        theme,
        toggleTheme,
    }
}
