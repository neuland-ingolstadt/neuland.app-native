import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface ThemeHook {
    accentColor: string
    toggleAccentColor: (name: string) => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with accentColor and toggleAccentColor properties.
 */
export function useTheme(): ThemeHook {
    const [accentColor, setAccentColor] = useState<string>('blue')

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = await AsyncStorage.getItem('accentColor')
                if (data != null) {
                    setAccentColor(data)
                } else {
                    setAccentColor('blue')
                }
            } catch (error) {
                console.error(
                    'Error while retrieving data from AsyncStorage:',
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

    return {
        accentColor,
        toggleAccentColor,
    }
}
