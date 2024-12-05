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
            const updatedQuicklinks = [quicklink, ...existingQuicklinks]
            const uniqueQuicklinks = Array.from(new Set(updatedQuicklinks))
            const neededQuicklinks = 3 - uniqueQuicklinks.length
            const additionalQuicklinks =
                neededQuicklinks > 0
                    ? defaultQuicklinks
                          .filter((link) => !uniqueQuicklinks.includes(link))
                          .slice(0, neededQuicklinks)
                    : []

            const finalQuicklinks = [
                ...uniqueQuicklinks,
                ...additionalQuicklinks,
            ].slice(0, 3)
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
