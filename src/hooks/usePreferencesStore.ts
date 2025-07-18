import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { defaultQuicklinks } from '@/data/constants'
import { zustandStorage } from '@/utils/storage'

export type AccentColor = 'blue' | 'green' | 'purple'

interface PreferencesStore {
	theme: string
	accentColor: AccentColor
	language: 'de' | 'en' | undefined
	appIcon: string | undefined
	unlockedAppIcons: string[]
	recentQuicklinks: string[]
	showSplashScreen: boolean
	setTheme: (theme: string) => void
	setAccentColor: (color: AccentColor) => void
	setLanguage: (language: 'en' | 'de') => void
	setAppIcon: (name: string) => void
	addUnlockedAppIcon: (name: string) => void
	addRecentQuicklink: (quicklink: string) => void
	setShowSplashScreen: (show: boolean) => void
	reset: () => void
}

const initialState: Omit<
	PreferencesStore,
	| 'setTheme'
	| 'setAccentColor'
	| 'setAppIcon'
	| 'addUnlockedAppIcon'
	| 'addRecentQuicklink'
	| 'reset'
	| 'setLanguage'
	| 'setShowSplashScreen'
> = {
	appIcon: undefined,
	language: undefined,
	theme: 'auto',
	accentColor: 'blue',
	unlockedAppIcons: [],
	recentQuicklinks: defaultQuicklinks,
	showSplashScreen: true
}

export const usePreferencesStore = create<PreferencesStore>()(
	persist(
		(set) => ({
			...initialState,
			setTheme: (theme: string) => {
				set({ theme })
			},
			setAccentColor: (accentColor: AccentColor) => {
				set({ accentColor })
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
			reset: () => {
				set(initialState)
				zustandStorage.removeItem('app-storage')
			}
		}),
		{
			name: 'app-storage',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
