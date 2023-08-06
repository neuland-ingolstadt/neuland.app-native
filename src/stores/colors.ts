import { type Theme } from '@react-navigation/native'

type AccentColors = Record<
    string,
    {
        name: string
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
        name: 'Default',
        light: '#2aa2ba',
        dark: '#37bdd8',
    },
    thi: {
        name: 'THI',
        light: '#0b468a',
        dark: '#115db3',
    },
    contrast: {
        name: 'Contrast',
        light: '#000000',
        dark: '#ffffff',
    },
    pink: {
        name: 'Pink',
        light: '#ea1a78',
        dark: '#f22a88',
    },
    magenta: {
        name: 'Magenta',
        light: '#ba2a8a',
        dark: '#d8379b',
    },
    purple: {
        name: 'Purple',
        light: '#74209e',
        dark: '#9b37d8',
    },
    yellow: {
        name: 'Yellow',
        light: '#d8c412',
        dark: '#e6d81f',
    },
    orange: {
        name: 'Orange',
        light: '#e3661d',
        dark: '#f1932e',
    },
    green: {
        name: 'Green',
        light: '#1fa31f',
        dark: '#37d837',
    },
}

export const lightColors: StaticThemeColors = {
    labelTertiaryColor: '#99999a',
    labelSecondaryColor: '#777778',
    labelColor: '#606062',
    labelBackground: '#d4d2d2',
    success: '#1fa31f',
    datePickerBackground: '#ebebec',
}

export const darkColors: StaticThemeColors = {
    labelSecondaryColor: '#8e8e8f',
    labelTertiaryColor: '#4b4b4c',
    labelColor: '#a4a4a5',
    labelBackground: '#4a4a4a',
    success: '#37d837',
    datePickerBackground: '#2a2a2c',
}
