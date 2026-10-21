import type { ColorSchemeName } from 'react-native'

export function resolveActiveTheme(
	theme: string,
	colorScheme: ColorSchemeName | null | undefined
): 'light' | 'dark' {
	if (theme === 'light' || theme === 'dark') {
		return theme
	}

	return colorScheme === 'dark' ? 'dark' : 'light'
}
