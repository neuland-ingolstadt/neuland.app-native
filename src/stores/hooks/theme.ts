import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Appearance, StatusBar, useColorScheme } from 'react-native'

export interface ThemeHook {
    accentColor: string
    toggleAccentColor: (name: string) => void
    theme: string
    toggleTheme: (name: 'light' | 'dark' | 'system') => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the theme and accent color across app sessions.
 * @returns ThemeHook object with accentColor, toggleAccentColor, theme, and toggleTheme properties.
 */
export function useTheme(): ThemeHook {
    const [accentColor, setAccentColor] = useState<string>('teal')
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
    const colorScheme = useColorScheme()

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = await AsyncStorage.getItem('accentColor')
                if (data != null) {
                    setAccentColor(data)
                }
                const themeData = await AsyncStorage.getItem('theme')
                if (themeData != null) {
                    setTheme(themeData as 'light' | 'dark' | 'system')
                } else {
                    setTheme(colorScheme === 'dark' ? 'dark' : 'light')
                }
            } catch (error) {
                console.error(
                    'Error while retrieving data from AsyncStorage:',
                    error
                )
            }
        }
        void loadAsyncStorageData()
    }, [colorScheme])

    useEffect(() => {
        if (theme === 'system') {
            StatusBar.setBarStyle(
                colorScheme === 'dark' ? 'light-content' : 'dark-content'
            )
            Appearance.setColorScheme(colorScheme)
        } else {
            StatusBar.setBarStyle(
                theme === 'dark' ? 'light-content' : 'dark-content'
            )
            Appearance.setColorScheme(theme === 'dark' ? 'dark' : 'light')
        }
    }, [theme, colorScheme])

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
     * @param name - The name of the new theme ('light', 'dark', or 'system').
     */
    function toggleTheme(name: 'light' | 'dark' | 'system'): void {
        setTheme(name)

        void AsyncStorage.setItem('theme', name)
    }

    return {
        accentColor,
        toggleAccentColor,
        theme,
        toggleTheme,
    }
}
