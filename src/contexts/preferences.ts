import { type CalendarMode } from '@/app/(tabs)/(timetable)/timetable'
import { defaultQuicklinks } from '@/data/constants'
import { useCallback, useMemo, useState } from 'react'
import { useMMKVObject, useMMKVString } from 'react-native-mmkv'

export interface PreferencesType {
    appIcon: string | undefined
    unlockedAppIcons: string[]
    setAppIcon: (name: string) => void
    addUnlockedAppIcon: (name: string) => void

    timetableMode: string | undefined
    setTimetableMode: (mode: CalendarMode) => void
    selectedDate: Date
    setSelectedDate: (date: Date) => void

    recentQuicklinks: string[]
    addRecentQuicklink: (quicklink: string) => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns PreferencesType object with various preference-related properties and functions.
 */
export function usePreferences(): PreferencesType {
    const [timetableMode, setTimetableMode] = useMMKVString('timetableMode')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [appIcon, setAppIcon] = useMMKVString('appIcon')
    const [unlockedAppIcons, setUnlockedAppIcons] =
        useMMKVObject<string[]>('unlockedAppIconsV2')
    const [recentQuicklinks, setRecentQuicklinks] =
        useMMKVObject<string[]>('recentQuicklinks')

    const addUnlockedAppIcon = useCallback(
        (name: string): void => {
            const newUnlockedAppIcons = new Set([
                ...(unlockedAppIcons ?? []),
                name,
            ])
            setUnlockedAppIcons(Array.from(newUnlockedAppIcons))
        },
        [unlockedAppIcons, setUnlockedAppIcons]
    )

    const addRecentQuicklink = useCallback(
        (quicklink: string): void => {
            const existingQuicklinks = recentQuicklinks ?? []

            // Create a new list with the new quicklink at the front
            const updatedQuicklinks = [quicklink, ...existingQuicklinks]

            // Remove duplicates by converting to a Set and back to an array
            const uniqueQuicklinks = Array.from(new Set(updatedQuicklinks))

            // If fewer than 3 quicklinks after deduplication, add default quicklinks
            const neededQuicklinks = 3 - uniqueQuicklinks.length
            const additionalQuicklinks =
                neededQuicklinks > 0
                    ? defaultQuicklinks
                          .filter((link) => !uniqueQuicklinks.includes(link))
                          .slice(0, neededQuicklinks)
                    : []

            // Combine unique quicklinks with additional quicklinks, ensuring the total length is 3
            const finalQuicklinks = [
                ...uniqueQuicklinks,
                ...additionalQuicklinks,
            ].slice(0, 3)

            // Update the state and storage with the final list
            setRecentQuicklinks(finalQuicklinks)
        },
        [recentQuicklinks, setRecentQuicklinks]
    )

    return useMemo(
        () => ({
            appIcon,
            unlockedAppIcons: unlockedAppIcons ?? [],
            setAppIcon,
            addUnlockedAppIcon,
            timetableMode,
            setTimetableMode,
            selectedDate,
            setSelectedDate,
            recentQuicklinks: recentQuicklinks ?? defaultQuicklinks,
            addRecentQuicklink,
        }),
        [
            appIcon,
            unlockedAppIcons,
            setAppIcon,
            addUnlockedAppIcon,
            timetableMode,
            setTimetableMode,
            selectedDate,
            setSelectedDate,
            recentQuicklinks,
            addRecentQuicklink,
        ]
    )
}
