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
import { usePathname } from 'expo-router'
import React, { useEffect } from 'react'
import {
    type AppStateStatus,
    Appearance,
    Platform,
    StyleSheet,
    useColorScheme,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import {
    useDashboard,
    useFlow,
    useFoodFilter,
    usePreferences,
    useRouteParams,
    useTheme,
    useUserKind,
} from '../contexts'
import { type AppTheme, accentColors, darkColors, lightColors } from './colors'
import {
    DashboardContext,
    FlowContext,
    FoodFilterContext,
    PreferencesContext,
    RouteParamsContext,
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
    const colorScheme = useColorScheme()
    const flow = useFlow()
    const routeParams = useRouteParams()
    const preferences = usePreferences()
    const pathname = usePathname()

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
                accentColors[themeHook.accentColor ?? 'blue'][scheme]
            return primary
        } catch (e) {
            return accentColors.blue[scheme]
        }
    }

    const lightTheme: AppTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: getPrimary('light'),
            ...lightColors,
        },
    }

    const darkTheme: AppTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: getPrimary('dark'),
            ...darkColors,
        },
    }

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }
        setTimeout(() => {
            trackEvent('Route', {
                pathname,
            })
        }, 0)
    }, [pathname, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('AccentColor', {
            color: themeHook.accentColor ?? 'blue',
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
        } else if (themeHook.theme === 'light') {
            Appearance.setColorScheme('light')
        } else {
            Appearance.setColorScheme(null)
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
                <ThemeProvider
                    value={colorScheme === 'dark' ? darkTheme : lightTheme}
                >
                    <BottomSheetModalProvider>
                        <ThemeContext.Provider value={themeHook}>
                            <PreferencesContext.Provider value={preferences}>
                                <FlowContext.Provider value={flow}>
                                    <UserKindContext.Provider value={userKind}>
                                        <FoodFilterContext.Provider
                                            value={foodFilter}
                                        >
                                            <DashboardContext.Provider
                                                value={dashboard}
                                            >
                                                <RouteParamsContext.Provider
                                                    value={routeParams}
                                                >
                                                    <SafeAreaProvider>
                                                        {children}
                                                    </SafeAreaProvider>
                                                </RouteParamsContext.Provider>
                                            </DashboardContext.Provider>
                                        </FoodFilterContext.Provider>
                                    </UserKindContext.Provider>
                                </FlowContext.Provider>
                            </PreferencesContext.Provider>
                        </ThemeContext.Provider>
                    </BottomSheetModalProvider>
                </ThemeProvider>
            </PersistQueryClientProvider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
