import { useEffect } from 'react'
import { Appearance } from 'react-native'
import { Uniwind } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { themeColorMap } from '@/styles/theme-colors'

function resolveUniwindTheme(theme: string): 'light' | 'dark' | 'system' {
	if (theme === 'light' || theme === 'dark') {
		return theme
	}

	return 'system'
}

function resolveActiveTheme(theme: string): 'light' | 'dark' {
	const resolved = resolveUniwindTheme(theme)
	if (resolved === 'light' || resolved === 'dark') {
		return resolved
	}

	return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
}

export function useUniwindThemeSync(): void {
	const theme = usePreferencesStore((state) => state.theme)
	const themeColor = usePreferencesStore((state) => state.themeColor)

	useEffect(() => {
		Uniwind.setTheme(resolveUniwindTheme(theme))
	}, [theme])

	useEffect(() => {
		const colors = themeColorMap[themeColor]
		const lightVariables = {
			'--color-primary': colors.light,
			'--color-secondary': colors.light,
			'--color-primary-background': `${colors.light}15`
		}
		const darkVariables = {
			'--color-primary': colors.dark,
			'--color-secondary': colors.dark,
			'--color-primary-background': `${colors.dark}25`
		}
		const activeTheme = resolveActiveTheme(theme)

		// Update the inactive theme first so the active theme wins on first render.
		if (activeTheme === 'light') {
			Uniwind.updateCSSVariables('dark', darkVariables)
			Uniwind.updateCSSVariables('light', lightVariables)
			return
		}

		Uniwind.updateCSSVariables('light', lightVariables)
		Uniwind.updateCSSVariables('dark', darkVariables)
	}, [theme, themeColor])
}
