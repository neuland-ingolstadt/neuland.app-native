import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface ThemeHook {
    accentColor: string
    theme: 'light' | 'dark' | 'auto'
    toggleAccentColor: (name: string) => void
    toggleTheme: (theme: 'light' | 'dark' | 'auto') => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with accentColor and toggleAccentColor properties.
 */
export function useTheme(): ThemeHook {
    const [accentColor, setAccentColor] = useState<string>('blue')
    const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const keys = ['accentColor', 'theme']
                const [accentColorData, themeData] = await Promise.all(
                    keys.map(async (key) => await AsyncStorage.getItem(key))
                )

                if (accentColorData != null) {
                    setAccentColor(accentColorData)
                } else {
                    setAccentColor('blue')
                }

                if (themeData != null) {
                    setTheme(themeData as 'light' | 'dark' | 'auto')
                } else {
                    setTheme('auto')
                }
            } catch (error) {
                console.error(
                    'Error while retrieving theme data from AsyncStorage:',
                    error
                )
            }
        }
        void loadAsyncStorageData()
    }, [])

    /**
     * Function to toggle the accent color of the app.
     * @param name - The name of the new accent color.
     */
    function toggleAccentColor(name: string): void {
        setAccentColor(name)
        void AsyncStorage.setItem('accentColor', name)
    }

    /**
     * Function to toggle the theme of the app.
     * @param theme - The new theme to be set.
     */
    function toggleTheme(theme: 'light' | 'dark' | 'auto'): void {
        setTheme(theme)
        void AsyncStorage.setItem('theme', theme)
    }

    return {
        accentColor,
        toggleAccentColor,
        theme,
        toggleTheme,
    }
}
