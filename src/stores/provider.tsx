import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { type Theme } from '@react-navigation/native'
import React from 'react'
import { useColorScheme } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'

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
}

export interface AppTheme extends Theme {
    colors: Colors
}

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
        },
    }

    const scheme = useColorScheme()

    return (
        <ThemeProvider value={scheme === 'dark' ? darkTheme : lightTheme}>
            <RootSiblingParent>{children}</RootSiblingParent>
        </ThemeProvider>
    )
}
