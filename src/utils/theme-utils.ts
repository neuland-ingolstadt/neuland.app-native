import type { ColorSchemeName } from 'react-native'
import type { ThemeColor } from '@/hooks/usePreferencesStore'

const VALID_THEME_COLORS: readonly ThemeColor[] = [
	'blue',
	'green',
	'purple',
	'orange'
]

export function resolveActiveTheme(
	theme: string,
	colorScheme: ColorSchemeName | null | undefined
): 'light' | 'dark' {
	if (theme === 'light' || theme === 'dark') {
		return theme
	}

	return colorScheme === 'dark' ? 'dark' : 'light'
}

/** Keep known accents; drop orange unless the survey unlock flag is set. */
export function resolvePersistedThemeColor(
	value: unknown,
	accentUnlocked: boolean
): ThemeColor | undefined {
	if (
		typeof value !== 'string' ||
		!(VALID_THEME_COLORS as readonly string[]).includes(value)
	) {
		return undefined
	}
	const color = value as ThemeColor
	if (color === 'orange' && !accentUnlocked) return undefined
	return color
}

/** Green and purple require a member login; the unlocked orange does not. */
export function resolveLoggedOutThemeColor(
	color: ThemeColor,
	accentUnlocked: boolean
): ThemeColor {
	if (color === 'orange' && accentUnlocked) return color
	return 'blue'
}
