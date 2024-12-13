import { useAppState, useOnlineManager } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useSessionStore } from '@/hooks/useSessionStore'
import i18n from '@/localization/i18n'
import { syncStoragePersister } from '@/utils/storage'
import { trackEvent } from '@aptabase/react-native'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { QueryClient, focusManager } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useSegments } from 'expo-router'
import React, { useEffect } from 'react'
import {
    type AppStateStatus,
    Appearance,
    Platform,
    StyleSheet,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { UnistylesProvider, UnistylesRuntime } from 'react-native-unistyles'

import { useDashboard, useUserKind } from '../contexts'
import { accentColors } from './colors'
import { DashboardContext, UserKindContext } from './contexts'

interface ProviderProps {
    children: React.ReactNode
}

function onAppStateChange(status: AppStateStatus): void {
    // React Query already supports in web browser refetch on window focus by default
    if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active')
    }
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
        },
    },
})

/**
 * Provider component that wraps the entire app and provides context for theme, user kind, and food filter.
 * @param children - The child components to be wrapped by the Provider.
 * @param rest - Additional props to be passed to the Provider.
 * @returns The Provider component.
 */
export default function Provider({
    children,
    ...rest
}: ProviderProps): JSX.Element {
    const userKind = useUserKind()
    const dashboard = useDashboard()
    const segments = useSegments()

    useOnlineManager()
    useAppState(onAppStateChange)
    const theme = usePreferencesStore((state) => state.theme)
    const accentColor = usePreferencesStore((state) => state.accentColor)
    const timetableMode = usePreferencesStore((state) => state.timetableMode)
    const appIcon = usePreferencesStore((state) => state.appIcon)
    const selectedRestaurants = useFoodFilterStore(
        (state) => state.selectedRestaurants
    )
    const analyticsInitialized = useSessionStore(
        (state) => state.analyticsInitialized
    )
    const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)

    useEffect(() => {
        // This effect uses segments instead of usePathname which resolves some issues with the router.
        if (!analyticsInitialized || !Array.isArray(segments)) {
            return
        }

        const lastSegment = segments[segments.length - 1]

        const path =
            typeof lastSegment === 'string'
                ? `/${lastSegment.replace(/[()]/g, '')}`
                : '/'

        requestAnimationFrame(() => {
            trackEvent('Route', { path })
        })
    }, [segments, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized) {
            return
        }
        trackEvent('AccentColor', {
            color: accentColor,
        })
    }, [accentColor, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized) {
            return
        }
        trackEvent('Theme', {
            theme: theme ?? 'auto',
        })
    }, [accentColor, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized) {
            return
        }
        if (Platform.OS === 'ios') {
            trackEvent('AppIcon', {
                appIcon: appIcon ?? 'default',
            })
        }
    }, [appIcon, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized || userKind.userKind === undefined) {
            return
        }
        trackEvent('UserKind', {
            userKind: userKind.userKind,
        })
    }, [userKind.userKind, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized) {
            return
        }

        trackEvent('SelectedRestaurants', {
            selectedRestaurants: selectedRestaurants.join(','),
        })
    }, [selectedRestaurants, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized) {
            return
        }

        const entries: Record<string, string> = {}
        dashboard.shownDashboardEntries?.forEach((entry, index) => {
            if (entry !== undefined) {
                entries[entry.key] = `Position ${index + 1}`
            }
        })

        if (Object.keys(entries).length > 0) {
            trackEvent('Dashboard', entries)
        }
    }, [dashboard.shownDashboardEntries, analyticsInitialized])

    useEffect(() => {
        if (!analyticsInitialized) {
            return
        }

        const entries: Record<string, string> = {}

        dashboard.hiddenDashboardEntries?.forEach((entry) => {
            if (entry !== undefined) {
                entries[entry.key] = 'Card hidden'
            }
        })

        if (Object.keys(entries).length > 0) {
            trackEvent('Dashboard', entries)
        }
    }, [dashboard.hiddenDashboardEntries, analyticsInitialized])

    useEffect((): void => {
        if (!analyticsInitialized) {
            return
        }
        trackEvent('Language', {
            food: foodLanguage,
        })
    }, [foodLanguage, analyticsInitialized])

    useEffect((): void => {
        if (!analyticsInitialized) {
            return
        }
        trackEvent('Language', {
            app: i18n.language,
        })
    }, [i18n.language, analyticsInitialized])

    useEffect((): void => {
        if (!analyticsInitialized) {
            return
        }
        trackEvent('TimetableMode', {
            timetableMode: timetableMode ?? 'list',
        })
    }, [timetableMode, analyticsInitialized])

    /**
     * Returns the primary color for a given color scheme.
     * @param scheme - The color scheme to get the primary color for. Can be either 'light' or 'dark'.
     * @returns The primary color for the given color scheme.
     */
    const getPrimary = (scheme: 'light' | 'dark'): string => {
        try {
            const primary = accentColors[accentColor][scheme]
            return primary
        } catch (e) {
            return accentColors.blue[scheme]
        }
    }

    useEffect(() => {
        UnistylesRuntime.updateTheme('dark', (currentTheme) => ({
            ...currentTheme,
            colors: {
                ...currentTheme.colors,
                // @ts-expect-error cannot verify that the new primary color is valid
                primary: getPrimary('dark'),
            },
        }))
        UnistylesRuntime.updateTheme('light', (currentTheme) => ({
            ...currentTheme,
            colors: {
                ...currentTheme.colors,
                // @ts-expect-error cannot verify that the new primary color is valid
                primary: getPrimary('light'),
            },
        }))
    }, [accentColor])

    useEffect(() => {
        const subscription = Appearance.addChangeListener(() => {})
        if (theme === 'dark') {
            Appearance.setColorScheme('dark')
            UnistylesRuntime.setAdaptiveThemes(false)
            UnistylesRuntime.setTheme('dark')
        } else if (theme === 'light') {
            Appearance.setColorScheme('light')
            UnistylesRuntime.setAdaptiveThemes(false)
            UnistylesRuntime.setTheme('light')
        } else {
            Appearance.setColorScheme(undefined)
            UnistylesRuntime.setAdaptiveThemes(true)
        }

        return () => {
            subscription.remove()
        }
    }, [theme])

    return (
        <GestureHandlerRootView style={styles.container}>
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{ persister: syncStoragePersister }}
            >
                <UnistylesProvider>
                    <ThemeProvider
                        value={
                            UnistylesRuntime.themeName === 'dark'
                                ? DarkTheme
                                : DefaultTheme
                        }
                    >
                        <BottomSheetModalProvider>
                            <UserKindContext.Provider value={userKind}>
                                <DashboardContext.Provider value={dashboard}>
                                    {children}
                                </DashboardContext.Provider>
                            </UserKindContext.Provider>
                        </BottomSheetModalProvider>
                    </ThemeProvider>
                </UnistylesProvider>
            </PersistQueryClientProvider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
