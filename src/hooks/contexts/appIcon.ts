import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface AppIconHook {
    appIcon: string
    unlockedAppIcons: string[]
    toggleAppIcon: (name: string) => void
    addUnlockedAppIcon: (name: string) => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with accentColor and toggleAccentColor properties.
 */
export function useAppIcon(): AppIconHook {
    const [appIcon, setAppIcon] = useState<string>('default')
    const [unlockedAppIcons, setUnlockedAppIcons] = useState<string[]>([])

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const icon = await AsyncStorage.getItem('appIcon')
                if (icon != null) {
                    setAppIcon(icon)
                }
                const unlockedAppIcons =
                    await AsyncStorage.getItem('unlockedAppIcons')
                if (unlockedAppIcons != null) {
                    const parsedIcons = JSON.parse(unlockedAppIcons)
                    if (
                        !Array.isArray(parsedIcons) ||
                        !parsedIcons.every((icon) => typeof icon === 'string')
                    ) {
                        console.error(
                            'Invalid data in unlockedAppIcons, expected array of strings'
                        )
                        return
                    }
                    setUnlockedAppIcons(parsedIcons)
                }
            } catch (error) {
                console.error(
                    'Error while retrieving appIcon data from AsyncStorage:',
                    error
                )
            }
        }
        void loadAsyncStorageData()
    }, [])

    /**
     * Function to toggle the app icon of the app.
     * @param name - The name of the new app icon.
     */
    function toggleAppIcon(name: string): void {
        setAppIcon(name)
        void AsyncStorage.setItem('appIcon', name)
    }

    /**
     * Function to add a new unlocked theme.
     * @param name - The name of the new unlocked theme.
     */
    function addUnlockedAppIcon(name: string): void {
        const newUnlockedAppIcons = new Set([...unlockedAppIcons, name])
        setUnlockedAppIcons(Array.from(newUnlockedAppIcons))
        void AsyncStorage.setItem(
            'unlockedAppIcons',
            JSON.stringify(Array.from(newUnlockedAppIcons))
        )
    }

    return {
        appIcon,
        unlockedAppIcons,
        toggleAppIcon,
        addUnlockedAppIcon,
    }
}
