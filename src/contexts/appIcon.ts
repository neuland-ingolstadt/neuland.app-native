import { storage } from '@/utils/storage'
import { useEffect, useState } from 'react'
import { useMMKVString } from 'react-native-mmkv'

export interface AppIconHook {
    appIcon: string | undefined
    unlockedAppIcons: string[]
    setAppIcon: (name: string) => void
    addUnlockedAppIcon: (name: string) => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with accentColor and toggleAccentColor properties.
 */
export function useAppIcon(): AppIconHook {
    const [appIcon, setAppIcon] = useMMKVString('appIcon')
    const [unlockedAppIcons, setUnlockedAppIcons] = useState<string[]>([])

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const unlockedAppIcons = storage.getString('unlockedAppIcons')
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
     * Function to add a new unlocked theme.
     * @param name - The name of the new unlocked theme.
     */
    function addUnlockedAppIcon(name: string): void {
        const newUnlockedAppIcons = new Set([...unlockedAppIcons, name])
        setUnlockedAppIcons(Array.from(newUnlockedAppIcons))
        storage.set(
            'unlockedAppIcons',
            JSON.stringify(Array.from(newUnlockedAppIcons))
        )
    }

    return {
        appIcon,
        unlockedAppIcons,
        setAppIcon,
        addUnlockedAppIcon,
    }
}
