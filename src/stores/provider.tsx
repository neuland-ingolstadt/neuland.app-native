import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { type Theme } from '@react-navigation/native'
import React, { createContext } from 'react'
import { useColorScheme } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'

import { type FoodFilter, useFoodFilter } from './hooks/food-filter'
import { useUserKind } from './hooks/user-kind'

interface ProviderProps {
    children: React.ReactNode
}

export interface Colors {
    text: string
    primary: string
    notification: string
    labelTertiaryColor: string
    labelSecondaryColor: string
    labelColor: string
    card: string
    border: string
    background: string
    labelBackground: string
}

export interface AppTheme extends Theme {
    colors: Colors
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
    updateUserKind: () => {},
})

export default function Provider({
    children,
    ...rest
}: ProviderProps): JSX.Element {
    const lightTheme: AppTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#2aa2ba',
            labelTertiaryColor: '#99999a',
            labelSecondaryColor: '#777778',
            labelColor: '#606062',
            labelBackground: '#d4d2d2',
        },
    }

    const darkTheme: AppTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: '#37bdd8',
            labelTertiaryColor: '#4b4b4c',
            labelSecondaryColor: '#8e8e8f',
            labelColor: '#a4a4a5',
            labelBackground: '#4a4a4a',
        },
    }

    const scheme = useColorScheme()

    const foodFilter = useFoodFilter()
    const userKind = useUserKind()

    return (
        <UserKindContext.Provider value={userKind}>
            <FoodFilterContext.Provider value={foodFilter}>
                <ThemeProvider
                    value={scheme === 'dark' ? darkTheme : lightTheme}
                >
                    <RootSiblingParent>{children}</RootSiblingParent>
                </ThemeProvider>
            </FoodFilterContext.Provider>
        </UserKindContext.Provider>
    )
}
