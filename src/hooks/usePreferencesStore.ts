import { defaultQuicklinks } from '@/data/constants'
import { zustandStorage } from '@/utils/storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const DEFAULT_ACCENT_COLOR = 'blue'

interface PreferencesStore {
    accentColor: string
    theme: string
    appIcon: string | undefined
    unlockedAppIcons: string[]
    timetableMode: string | undefined
    timetableDays: number
    selectedDate: Date
    recentQuicklinks: string[]
    setAccentColor: (language: string) => void
    setTheme: (theme: string) => void
    setAppIcon: (name: string) => void
    addUnlockedAppIcon: (name: string) => void
    setTimetableMode: (mode: string) => void
    setTimetableDays: (mode: number) => void
    setSelectedDate: (date: Date) => void
    addRecentQuicklink: (quicklink: string) => void
    reset: () => void
}

const initialState: Omit<
    PreferencesStore,
    | 'setAccentColor'
    | 'setTheme'
    | 'setAppIcon'
    | 'addUnlockedAppIcon'
    | 'setTimetableMode'
    | 'setTimetableDays'
    | 'setSelectedDate'
    | 'addRecentQuicklink'
    | 'reset'
> = {
    accentColor: DEFAULT_ACCENT_COLOR,
    appIcon: undefined,
    theme: 'auto',
    unlockedAppIcons: [],
    timetableMode: undefined,
    timetableDays: 3,
    selectedDate: new Date(),
    recentQuicklinks: defaultQuicklinks,
}

export const usePreferencesStore = create<PreferencesStore>()(
    persist(
        (set) => ({
            ...initialState,
            setAccentColor: (accentColor: string) => {
                set({ accentColor })
            },
            setTheme: (theme: string) => {
                set({ theme })
            },
            setAppIcon: (appIcon: string) => {
                set({ appIcon })
            },
            addUnlockedAppIcon: (name: string) => {
                set((state) => {
                    const newUnlockedAppIcons = new Set([
                        ...state.unlockedAppIcons,
                        name,
                    ])
                    return { unlockedAppIcons: Array.from(newUnlockedAppIcons) }
                })
            },
            setTimetableMode: (timetableMode: string) => {
                set({ timetableMode })
            },
            setTimetableDays: (timetableDays: number) => {
                set({ timetableDays })
            },
            setSelectedDate: (selectedDate: Date) => {
                set({ selectedDate })
            },
            addRecentQuicklink: (quicklink: string) => {
                set((state) => {
                    const existingQuicklinks = state.recentQuicklinks ?? []
                    const updatedQuicklinks = [quicklink, ...existingQuicklinks]
                    const uniqueQuicklinks = Array.from(
                        new Set(updatedQuicklinks)
                    )
                    const neededQuicklinks = 3 - uniqueQuicklinks.length
                    const additionalQuicklinks =
                        neededQuicklinks > 0
                            ? defaultQuicklinks
                                  .filter(
                                      (link) => !uniqueQuicklinks.includes(link)
                                  )
                                  .slice(0, neededQuicklinks)
                            : []

                    const finalQuicklinks = [
                        ...uniqueQuicklinks,
                        ...additionalQuicklinks,
                    ].slice(0, 3)
                    return { recentQuicklinks: finalQuicklinks }
                })
            },
            reset: () => {
                set(initialState)
                zustandStorage.removeItem('app-storage')
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
)
