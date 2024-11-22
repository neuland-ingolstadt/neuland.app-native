import { DEFAULT_ACCENT_COLOR } from '@/contexts/theme'
import { useAppState, useOnlineManager } from '@/hooks'
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
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { UnistylesProvider, UnistylesRuntime } from 'react-native-unistyles'

import {
    useDashboard,
    useFlow,
    useFoodFilter,
    usePreferences,
    useTheme,
    useUserKind,
} from '../contexts'
import { accentColors } from './colors'
import {
    DashboardContext,
    FlowContext,
    FoodFilterContext,
    PreferencesContext,
    ThemeContext,
    UserKindContext,
} from './contexts'

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
    const foodFilter = useFoodFilter()
    const userKind = useUserKind()
    const themeHook = useTheme()
    const dashboard = useDashboard()
    const flow = useFlow()
    const preferences = usePreferences()
    const segments = useSegments()

    useOnlineManager()
    useAppState(onAppStateChange)
    /**
     * Returns the primary color for a given color scheme.
     * @param scheme - The color scheme to get the primary color for. Can be either 'light' or 'dark'.
     * @returns The primary color for the given color scheme.
     */
    const getPrimary = (scheme: 'light' | 'dark'): string => {
        try {
            const primary =
                accentColors[themeHook.accentColor ?? DEFAULT_ACCENT_COLOR][
                    scheme
                ]
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
    }, [themeHook.accentColor])

    useEffect(() => {
        // This effect uses segments instead of usePathname which resolves some issues with the router.
        if (!flow.analyticsInitialized || !Array.isArray(segments)) {
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
    }, [segments, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('AccentColor', {
            color: themeHook.accentColor ?? DEFAULT_ACCENT_COLOR,
        })
    }, [themeHook.accentColor, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('Theme', {
            theme: themeHook.theme ?? 'auto',
        })
    }, [themeHook.accentColor, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }
        if (Platform.OS === 'ios') {
            trackEvent('AppIcon', {
                appIcon: preferences.appIcon ?? 'default',
            })
        }
    }, [preferences.appIcon, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized || userKind.userKind === undefined) {
            return
        }
        trackEvent('UserKind', {
            userKind: userKind.userKind,
        })
    }, [userKind.userKind, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }

        trackEvent('SelectedRestaurants', {
            selectedRestaurants: foodFilter.selectedRestaurants.join(','),
        })
    }, [foodFilter.selectedRestaurants, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
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
    }, [dashboard.shownDashboardEntries, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
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
    }, [dashboard.hiddenDashboardEntries, flow.analyticsInitialized])

    useEffect((): void => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('Language', {
            food: foodFilter.foodLanguage,
        })
    }, [foodFilter.foodLanguage, flow.analyticsInitialized])

    useEffect((): void => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('Language', {
            app: i18n.language,
        })
    }, [i18n.language, flow.analyticsInitialized])

    useEffect((): void => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('TimetableMode', {
            timetableMode: preferences.timetableMode ?? 'list',
        })
    }, [preferences.timetableMode, flow.analyticsInitialized])

    useEffect(() => {
        const subscription = Appearance.addChangeListener(() => {})
        if (themeHook.theme === 'dark') {
            Appearance.setColorScheme('dark')
            UnistylesRuntime.setAdaptiveThemes(false)
            UnistylesRuntime.setTheme('dark')
        } else if (themeHook.theme === 'light') {
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
    }, [themeHook.theme])

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
                        <ThemeContext.Provider value={themeHook}>
                            <PreferencesContext.Provider value={preferences}>
                                <BottomSheetModalProvider>
                                    <FlowContext.Provider value={flow}>
                                        <UserKindContext.Provider
                                            value={userKind}
                                        >
                                            <FoodFilterContext.Provider
                                                value={foodFilter}
                                            >
                                                <DashboardContext.Provider
                                                    value={dashboard}
                                                >
                                                    <SafeAreaProvider>
                                                        {children}
                                                    </SafeAreaProvider>
                                                </DashboardContext.Provider>
                                            </FoodFilterContext.Provider>
                                        </UserKindContext.Provider>
                                    </FlowContext.Provider>
                                </BottomSheetModalProvider>
                            </PreferencesContext.Provider>
                        </ThemeContext.Provider>
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
