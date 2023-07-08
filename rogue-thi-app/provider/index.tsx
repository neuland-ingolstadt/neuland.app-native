import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { NativeBaseProvider, extendTheme } from 'native-base'
import React from 'react'
import { useColorScheme } from 'react-native'

interface ProviderProps {
    children: React.ReactNode
}

export function Provider({ children, ...rest }: ProviderProps): JSX.Element {
    const scheme = useColorScheme()
    const config = {
        useSystemColorMode: true,
    }
    const customTheme = extendTheme({ config })

    return (
        <NativeBaseProvider theme={customTheme}>
            <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
                {children}
            </ThemeProvider>
        </NativeBaseProvider>
    )
}
