import type { Theme } from '@react-navigation/native'

type AccentColors = Record<
    string,
    {
        light: string
        dark: string
    }
>

interface StaticThemeColors {
    labelTertiaryColor: string
    labelSecondaryColor: string
    labelColor: string
    labelBackground: string
    success: string
    datePickerBackground: string
    card: string
    cardButton: string
    notification: string
    warning: string
    inputBackground: string
    contrast: string
    cardContrast: string
}

export interface Colors extends StaticThemeColors {
    text: string
    primary: string
    card: string
    border: string
    background: string
}

export interface AppTheme extends Theme {
    colors: Colors
}

export const accentColors: AccentColors = {
    green: {
        light: '#00b800',
        dark: '#41FF00',
    },
    teal: {
        light: '#2aa2ba',
        dark: '#37bdd8',
    },
    blue: {
        light: '#0079fa',
        dark: '#0b83ff',
    },
    contrast: {
        light: '#000000',
        dark: '#ffffff',
    },
    purple: {
        light: '#74209e',
        dark: '#9b37d8',
    },
    pink: {
        light: '#ea1a78',
        dark: '#f8277b',
    },
    yellow: {
        light: '#f8c600',
        dark: '#fedc00',
    },
    orange: {
        light: '#e3661d',
        dark: '#f1932e',
    },
    brown: {
        light: '#9b7d5c',
        dark: '#a58463',
    },
}
