import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import React, { createContext } from 'react'
import { useColorScheme } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'

import { type AppTheme, accentColors, darkColors, lightColors } from './colors'
import { useDashboard, useFoodFilter, useTheme, useUserKind } from './hooks'
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
    userKind: 'guest',
    toggleUserKind: () => {},
})

export const ThemeContext = createContext<any>({
    accentColor: 'teal',
    toggleAccentColor: () => {},
    theme: 'system',
    toggleTheme: () => {},
})

export const DashboardContext = createContext<Dashboard>({
    shownDashboardEntries: [],
    hiddenDashboardEntries: [],
    hideDashboardEntry: () => {},
    bringBackDashboardEntry: () => {},
    resetOrder: () => {},
    updateDashboardOrder: () => {},
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

    /**
     * Returns the appropriate theme based on the current user preference and system scheme.
     * @returns {AppTheme} The theme object to be used for styling the app.
     */

    const colorScheme = useColorScheme()
    const userTheme = (): AppTheme => {
        switch (themeHook.theme) {
            case 'light':
                return lightTheme
            case 'dark':
                return darkTheme
            case 'system':
                return colorScheme === 'dark' ? darkTheme : lightTheme // Updated based on system color scheme
            default:
                return lightTheme
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
        <ThemeProvider value={userTheme()}>
            <ThemeContext.Provider value={themeHook}>
                <UserKindContext.Provider value={userKind}>
                    <DashboardContext.Provider value={dashboard}>
                        <FoodFilterContext.Provider value={foodFilter}>
                            <RootSiblingParent>{children}</RootSiblingParent>
                        </FoodFilterContext.Provider>
                    </DashboardContext.Provider>
                </UserKindContext.Provider>
            </ThemeContext.Provider>
        </ThemeProvider>
    )
}
