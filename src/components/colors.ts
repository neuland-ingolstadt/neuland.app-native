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
    teal: {
        light: '#2aa2ba',
        dark: '#37bdd8',
    },
    yellow: {
        light: '#f8c600',
        dark: '#fedc00',
    },
    orange: {
        light: '#e3661d',
        dark: '#f1932e',
    },
    dirt: {
        light: '#9b7d5c',
        dark: '#a58463',
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
    notification: '#ff0000',
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
