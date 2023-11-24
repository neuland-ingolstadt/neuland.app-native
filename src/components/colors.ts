import { type Theme } from '@react-navigation/native'

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
    notification: string
}

export interface Colors extends StaticThemeColors {
    text: string
    primary: string
    notification: string
    card: string
    border: string
    background: string
}

export interface AppTheme extends Theme {
    colors: Colors
}

export const accentColors: AccentColors = {
    teal: {
        light: '#73c3e1',
        dark: '#73c3e1',
    },
    blue: {
        light: '#1d4aee',
        dark: '#1d4aee',
    },
    contrast: {
        light: '#000000',
        dark: '#ffffff',
    },
    pink: {
        light: '#d438ac',
        dark: '#d438ac',
    },
    purple: {
        light: '#a052f6',
        dark: '#a052f6',
    },
    green: {
        light: '#357a32',
        dark: '#75fb4c',
    },
    yellow: {
        light: '#f7d046',
        dark: '#f7d046',
    },
    orange: {
        light: '#e78431',
        dark: '#e78431',
    },
}

export const lightColors: StaticThemeColors = {
    labelTertiaryColor: '#99999a',
    labelSecondaryColor: '#777778',
    labelColor: '#606062',
    labelBackground: '#d4d2d2',
    success: '#1fa31f',
    datePickerBackground: '#ebebec',
    card: '#ffffff',
    notification: '#f20000',
}

export const darkColors: StaticThemeColors = {
    labelSecondaryColor: '#8e8e8f',
    labelTertiaryColor: '#4b4b4c',
    labelColor: '#a4a4a5',
    labelBackground: '#4a4a4a',
    success: '#37d837',
    datePickerBackground: '#2a2a2c',
    card: '#1c1c1d',
    notification: '#ff0000',
}
