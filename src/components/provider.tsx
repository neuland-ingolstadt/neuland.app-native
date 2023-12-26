import { type AppIconHook } from '@/hooks/contexts/appIcon'
import { type FlowHook } from '@/hooks/contexts/flow'
import {
    DEFAULT_TIMETABLE_MODE,
    type TimetableHook,
    useTimetable,
} from '@/hooks/contexts/timetable'
import i18n from '@/localization/i18n'
import { trackEvent } from '@aptabase/react-native'
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { usePathname } from 'expo-router'
import React, { createContext, useEffect } from 'react'
import { Platform, StyleSheet, useColorScheme } from 'react-native'
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
} from '../hooks/contexts'
import { type Dashboard } from '../hooks/contexts/dashboard'
import { type FoodFilter } from '../hooks/contexts/foodFilter'
import {
    type Notifications,
    useNotifications,
} from '../hooks/contexts/notifications'
import { type RouteParams } from '../hooks/contexts/routing'
import { type AppTheme, accentColors, darkColors, lightColors } from './colors'

interface ProviderProps {
    children: React.ReactNode
}

export const RouteParamsContext = createContext<RouteParams>({
    routeParams: '',
    updateRouteParams: () => {},
    lecture: null,
    updateLecture: () => {},
})

export const FoodFilterContext = createContext<FoodFilter>({
    allergenSelection: [],
    preferencesSelection: [],
    selectedRestaurants: [],
    showStatic: false,
    foodLanguage: 'default',
    toggleSelectedAllergens: () => {},
    initAllergenSelection: () => {},
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
    accentColor: 'blue',
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

export const TimetableContext = createContext<TimetableHook>({
    timetableMode: DEFAULT_TIMETABLE_MODE,
    setTimetableMode: () => {},
    selectedDate: new Date(),
    setSelectedDate: () => {},
})

export const NotificationContext = createContext<Notifications>({
    timetableNotifications: {},
    updateTimetableNotifications: () => {},
    deleteTimetableNotifications: () => {},
    removeNotification: () => {},
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
    const pathname = usePathname()
    const timetableHook = useTimetable()
    const notifications = useNotifications()

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

    useEffect((): void => {
        if (!flow.analyticsInitialized) {
            return
        }
        trackEvent('TimetableMode', {
            timetableMode: timetableHook.timetableMode,
        })
    }, [flow.analyticsAllowed, flow.analyticsInitialized])

    return (
        <GestureHandlerRootView style={styles.container}>
            <ThemeProvider
                value={colorScheme === 'light' ? lightTheme : darkTheme}
            >
                <TimetableContext.Provider value={timetableHook}>
                    <NotificationContext.Provider value={notifications}>
                        <ThemeContext.Provider value={themeHook}>
                            <AppIconContext.Provider value={appIcon}>
                                <FlowContext.Provider value={flow}>
                                    <UserKindContext.Provider value={userKind}>
                                        <DashboardContext.Provider
                                            value={dashboard}
                                        >
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
                    </NotificationContext.Provider>
                </TimetableContext.Provider>
            </ThemeProvider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
