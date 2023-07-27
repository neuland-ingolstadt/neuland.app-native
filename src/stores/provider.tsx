import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import React, { createContext } from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'

import { type AppTheme, accentColors, darkColors, lightColors } from './colors'
import { type FoodFilter, useFoodFilter } from './hooks/food-filter'
import { useThemeHook } from './hooks/theme'
import { useUserKind } from './hooks/user-kind'

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
    const themeHook = useThemeHook()
    const scheme = useColorScheme()

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
            console.log(e)
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

    /**
     * Returns the appropriate theme based on the current user preference and system scheme.
     * @returns {AppTheme} The theme object to be used for styling the app.
     */
    const userTheme = (): AppTheme => {
        switch (themeHook.theme) {
            case 'light':
                return lightTheme
            case 'dark':
                return darkTheme
            case 'system':
                return scheme === 'dark' ? darkTheme : lightTheme
            default:
                return lightTheme
        }
    }
    return (
        <ThemeContext.Provider value={themeHook}>
            <UserKindContext.Provider value={userKind}>
                <FoodFilterContext.Provider value={foodFilter}>
                    <ThemeProvider value={userTheme()}>
                        <StatusBar
                            barStyle={
                                userTheme().dark
                                    ? 'light-content'
                                    : 'dark-content'
                            }
                        />
                        <RootSiblingParent>{children}</RootSiblingParent>
                    </ThemeProvider>
                </FoodFilterContext.Provider>
            </UserKindContext.Provider>
        </ThemeContext.Provider>
    )
}
