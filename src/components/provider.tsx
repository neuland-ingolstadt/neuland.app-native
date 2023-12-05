import { type AppIconHook } from '@/hooks/appIcon'
import { type FlowHook } from '@/hooks/flow'
import i18n from '@/localization/i18n'
import { trackEvent } from '@aptabase/react-native'
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { usePathname } from 'expo-router'
import React, { createContext, useEffect, useRef, useState } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'

import {
    useAppIcon,
    useDashboard,
    useFlow,
    useFoodFilter,
    useRouteParams,
    useTheme,
    useUserKind,
} from '../hooks'
import { type Dashboard } from '../hooks/dashboard'
import { type FoodFilter } from '../hooks/foodFilter'
import { type RouteParams } from '../hooks/routing'
import { type AppTheme, accentColors, darkColors, lightColors } from './colors'

interface ProviderProps {
    children: React.ReactNode
}

export const RouteParamsContext = createContext<RouteParams>({
    routeParams: '',
    updateRouteParams: () => {},
})

export const FoodFilterContext = createContext<FoodFilter>({
    allergenSelection: [],
    preferencesSelection: [],
    selectedRestaurants: [],
    showStatic: false,
    foodLanguage: 'default',
    toggleSelectedAllergens: () => {},
    toggleSelectedPreferences: () => {},
    toggleSelectedRestaurant: () => {},
    toggleShowStatic: () => {},
    toggleFoodLanguage: () => {},
})

export const UserKindContext = createContext<any>({
    userKind: 'student',
    userFaculty: 'unknown',
    userFullName: '',
    toggleUserKind: () => {},
    updateUserFullName: () => {},
})

export const ThemeContext = createContext<any>({
    accentColor: 'green',
    toggleAccentColor: () => {},
})

export const AppIconContext = createContext<AppIconHook>({
    appIcon: 'default',
    unlockedAppIcons: [],
    toggleAppIcon: () => {},
    addUnlockedAppIcon: () => {},
})

export const DashboardContext = createContext<Dashboard>({
    shownDashboardEntries: [],
    hiddenDashboardEntries: [],
    hideDashboardEntry: () => {},
    bringBackDashboardEntry: () => {},
    resetOrder: () => {},
    updateDashboardOrder: () => {},
})

export const FlowContext = createContext<FlowHook>({
    isOnboarded: true,
    toggleOnboarded: () => {},
    isUpdated: true,
    toggleUpdated: () => {},
    analyticsAllowed: false,
    toggleAnalytics: () => {},
    analyticsInitialized: false,
    initializeAnalytics: () => {},
})

export const ReloadProvider = createContext<any>({
    reload: false,
    toggleReload: () => {},
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
    const appIcon = useAppIcon()
    const [currentColorScheme, setCurrentColorScheme] = useState(colorScheme)
    const onColorSchemeChange = useRef<NodeJS.Timeout>()
    const pathname = usePathname()

    // iOS workaround to prevent change of the color scheme while the app is in the background
    // https://github.com/facebook/react-native/issues/35972
    // https://github.com/facebook/react-native/pull/39439 (should be fixed in v0.73)
    useEffect(() => {
        if (colorScheme !== currentColorScheme) {
            onColorSchemeChange.current = setTimeout(() => {
                setCurrentColorScheme(colorScheme)
            }, 1000)
        } else if (onColorSchemeChange.current != null) {
            clearTimeout(onColorSchemeChange.current)
        }
    }, [colorScheme])

    /**
     * Returns the primary color for a given color scheme.
     * @param scheme - The color scheme to get the primary color for. Can be either 'light' or 'dark'.
     * @returns The primary color for the given color scheme.
     */
    const getPrimary = (scheme: 'light' | 'dark'): string => {
        try {
            const primary = accentColors[themeHook.accentColor][scheme]
            return primary
        } catch (e) {
            return accentColors.green[scheme]
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
            color: themeHook.accentColor,
        })
    }, [themeHook.accentColor, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
            return
        }
        if (Platform.OS === 'ios') {
            trackEvent('AppIcon', {
                appIcon: appIcon.appIcon,
            })
        }
    }, [appIcon.appIcon, flow.analyticsInitialized])

    useEffect(() => {
        if (!flow.analyticsInitialized) {
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

        dashboard.shownDashboardEntries.forEach((entry, index) => {
            entries[entry.key] = `Position ${index + 1}`
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

        dashboard.hiddenDashboardEntries.forEach((entry) => {
            entries[entry.key] = 'Card hidden'
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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider
                value={
                    (Platform.OS === 'android'
                        ? colorScheme
                        : currentColorScheme) === 'light'
                        ? lightTheme
                        : darkTheme
                }
            >
                <ThemeContext.Provider value={themeHook}>
                    <AppIconContext.Provider value={appIcon}>
                        <FlowContext.Provider value={flow}>
                            <UserKindContext.Provider value={userKind}>
                                <DashboardContext.Provider value={dashboard}>
                                    <FoodFilterContext.Provider
                                        value={foodFilter}
                                    >
                                        <RouteParamsContext.Provider
                                            value={routeParams}
                                        >
                                            <RootSiblingParent>
                                                {children}
                                            </RootSiblingParent>
                                        </RouteParamsContext.Provider>
                                    </FoodFilterContext.Provider>
                                </DashboardContext.Provider>
                            </UserKindContext.Provider>
                        </FlowContext.Provider>
                    </AppIconContext.Provider>
                </ThemeContext.Provider>
            </ThemeProvider>
        </GestureHandlerRootView>
    )
}
