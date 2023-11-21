import { type AppIconHook } from '@/hooks/appIcon'
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import React, { createContext, useEffect, useRef, useState } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'

import {
    useAppIcon,
    useDashboard,
    useFlow,
    useFoodFilter,
    useMobility,
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
    accentColor: 'teal',
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

export const MobilityContext = createContext<any>({
    mobilityKind: 'bus',
    mobilityStation: 'Hauptbahnhof',
    toggleMobility: () => {},
    toggleStation: () => {},
})

export const FlowContext = createContext<any>({
    isOnboarded: true,
    toggleOnboarded: () => {},
    isUpdated: true,
    toggleUpdated: () => {},
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
    const mobility = useMobility()
    const colorScheme = useColorScheme()
    const flow = useFlow()
    const routeParams = useRouteParams()
    const appIcon = useAppIcon()

    // iOS workaround to prevent change of the color scheme while the app is in the background
    // https://github.com/facebook/react-native/issues/35972
    // https://github.com/facebook/react-native/pull/39439 (should be fixed in v0.73)
    const [currentColorScheme, setCurrentColorScheme] = useState(colorScheme)
    const onColorSchemeChange = useRef<NodeJS.Timeout>()

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
            return accentColors.teal[scheme]
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
                                        <MobilityContext.Provider
                                            value={mobility}
                                        >
                                            <RouteParamsContext.Provider
                                                value={routeParams}
                                            >
                                                <RootSiblingParent>
                                                    {children}
                                                </RootSiblingParent>
                                            </RouteParamsContext.Provider>
                                        </MobilityContext.Provider>
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
