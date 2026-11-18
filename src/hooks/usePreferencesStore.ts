import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { defaultQuicklinks } from '@/data/constants'
import { zustandStorage } from '@/utils/storage'

export type ThemeColor = 'blue' | 'green' | 'purple'

const VALID_THEME_COLORS: readonly ThemeColor[] = ['blue', 'green', 'purple']

function isThemeColor(value: unknown): value is ThemeColor {
	return (
		typeof value === 'string' &&
		(VALID_THEME_COLORS as readonly string[]).includes(value)
	)
}

interface PreferencesStore {
	theme: string
	themeColor: ThemeColor
	language: 'de' | 'en' | undefined
	appIcon: string | undefined
	unlockedAppIcons: string[]
	recentQuicklinks: string[]
	showSplashScreen: boolean
	autoShowNextDay: boolean
	autoShowNextDayTimeMinutes: number
	setTheme: (theme: string) => void
	setThemeColor: (color: ThemeColor) => void
	setLanguage: (language: 'en' | 'de') => void
	setAppIcon: (name: string) => void
	addUnlockedAppIcon: (name: string) => void
	addRecentQuicklink: (quicklink: string) => void
	setShowSplashScreen: (show: boolean) => void
	setAutoShowNextDay: (show: boolean) => void
	setAutoShowNextDayTimeMinutes: (minutes: number) => void
	reset: () => void
}

const initialState: Omit<
	PreferencesStore,
	| 'setTheme'
	| 'setThemeColor'
	| 'setAppIcon'
	| 'addUnlockedAppIcon'
	| 'addRecentQuicklink'
	| 'reset'
	| 'setLanguage'
	| 'setShowSplashScreen'
	| 'setAutoShowNextDay'
	| 'setAutoShowNextDayTimeMinutes'
> = {
	appIcon: undefined,
	language: undefined,
	theme: 'auto',
	themeColor: 'blue',
	unlockedAppIcons: [],
	recentQuicklinks: defaultQuicklinks,
	showSplashScreen: false,
	autoShowNextDay: false,
	autoShowNextDayTimeMinutes: 18 * 60
}

export const usePreferencesStore = create<PreferencesStore>()(
	persist(
		(set) => ({
			...initialState,
			setTheme: (theme: string) => {
				set({ theme })
			},
			setThemeColor: (themeColor: ThemeColor) => {
				set({ themeColor })
			},
			setLanguage: (language: 'de' | 'en') => {
				set({ language })
			},
			setAppIcon: (appIcon: string) => {
				set({ appIcon })
			},
			setShowSplashScreen: (showSplashScreen: boolean) => {
				set({ showSplashScreen })
			},
			addUnlockedAppIcon: (name: string) => {
				set((state) => {
					const newUnlockedAppIcons = new Set([...state.unlockedAppIcons, name])
					return { unlockedAppIcons: Array.from(newUnlockedAppIcons) }
				})
			},
			addRecentQuicklink: (quicklink: string) => {
				set((state) => {
					const existingQuicklinks = state.recentQuicklinks ?? []
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
						...additionalQuicklinks
					].slice(0, 3)
					return { recentQuicklinks: finalQuicklinks }
				})
			},
			setAutoShowNextDay: (autoShowNextDay: boolean) => {
				set({ autoShowNextDay })
			},
			setAutoShowNextDayTimeMinutes: (autoShowNextDayTimeMinutes: number) => {
				set({ autoShowNextDayTimeMinutes })
			},
			reset: () => {
				set(initialState)
				zustandStorage.removeItem('app-storage')
			}
		}),
		{
			name: 'app-storage',
			storage: createJSONStorage(() => zustandStorage),
			merge: (persistedState, currentState) => {
				const persisted = (persistedState ?? {}) as Partial<PreferencesStore>
				return {
					...currentState,
					...persisted,
					// Drop unknown accents left from feature branches (e.g. orange).
					themeColor: isThemeColor(persisted.themeColor)
						? persisted.themeColor
						: currentState.themeColor
				}
			}
		}
	)
)
