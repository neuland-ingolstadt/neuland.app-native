import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import React, { createContext } from 'react'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'

import { type AppTheme, accentColors, darkColors, lightColors } from './colors'
import {
    useDashboard,
    useFlow,
    useFoodFilter,
    useMobility,
    useTheme,
    useUserKind,
} from './hooks'
import { type Dashboard } from './hooks/dashboard'
import { type FoodFilter } from './hooks/foodFilter'

interface ProviderProps {
    children: React.ReactNode
}

export const FoodFilterContext = createContext<FoodFilter>({
    allergenSelection: [],
    preferencesSelection: [],
    selectedRestaurants: [],
    toggleSelectedAllergens: () => {},
    toggleSelectedPreferences: () => {},
    toggleSelectedRestaurant: () => {},
})

export const UserKindContext = createContext<any>({
    userKind: 'student',
    userFaculty: 'unknown',
    toggleUserKind: () => {},
})

export const ThemeContext = createContext<any>({
    accentColor: 'teal',
    toggleAccentColor: () => {},
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
                value={colorScheme === 'dark' ? darkTheme : lightTheme}
            >
                <ThemeContext.Provider value={themeHook}>
                    <FlowContext.Provider value={flow}>
                        <UserKindContext.Provider value={userKind}>
                            <DashboardContext.Provider value={dashboard}>
                                <FoodFilterContext.Provider value={foodFilter}>
                                    <MobilityContext.Provider value={mobility}>
                                        <RootSiblingParent>
                                            {children}
                                        </RootSiblingParent>
                                    </MobilityContext.Provider>
                                </FoodFilterContext.Provider>
                            </DashboardContext.Provider>
                        </UserKindContext.Provider>
                    </FlowContext.Provider>
                </ThemeContext.Provider>
            </ThemeProvider>
        </GestureHandlerRootView>
    )
}
