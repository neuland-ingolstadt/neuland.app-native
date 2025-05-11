import type { Theme } from '@react-navigation/native'

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
