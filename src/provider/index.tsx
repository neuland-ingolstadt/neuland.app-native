import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { type Theme } from '@react-navigation/native'
import { NativeBaseProvider, extendTheme } from 'native-base'
import React from 'react'
import { useColorScheme } from 'react-native'

interface ProviderProps {
    children: React.ReactNode
}

export interface Colors {
    text: string
    primary: string
    background: string
    secondaryText: string
    placeholderText: string
    inputBackground: string
    secondary: string
    accent: string
    accentBackground: string
    uiAccent: string
    card: string
    border: string
    notification: string
}

export interface AppTheme extends Theme {
    colors: Colors
}

export function Provider({ children, ...rest }: ProviderProps): JSX.Element {
    const lightTheme: AppTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            secondary: '#fff',
            background: '#f1f2f7',
            placeholderText: '#7d7f86',
            inputBackground: '#dee1e7',
            secondaryText: '#666',
            accent: '#0a84ff',
            accentBackground: 'rgba(10, 132, 255, 0.1)',
            uiAccent: '#c3c4c6',
        },
    }

    const darkTheme: AppTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            text: '#fff',
            background: '#000',
            placeholderText: '#666',
            inputBackground: '#1e2022',
            secondaryText: '#999',
            secondary: '#1a1d1e',
            accent: '#0a84ff',
            accentBackground: 'rgba(10, 132, 255, 0.1)',
            uiAccent: '#68707e',
        },
    }

    const scheme = useColorScheme()
    const config = {
        useSystemColorMode: true,
    }
    const customTheme = extendTheme({ config })

    return (
        <NativeBaseProvider theme={customTheme}>
            <ThemeProvider value={scheme === 'dark' ? darkTheme : lightTheme}>
                {children}
            </ThemeProvider>
        </NativeBaseProvider>
    )
}
