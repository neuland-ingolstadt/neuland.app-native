import { useEffect } from 'react'
import { Uniwind } from 'uniwind'
import { themeColorMap } from '@/components/provider'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'

function resolveUniwindTheme(theme: string): 'light' | 'dark' | 'system' {
	if (theme === 'light' || theme === 'dark') {
		return theme
	}

	return 'system'
}

export function useUniwindThemeSync(): void {
	const theme = usePreferencesStore((state) => state.theme)
	const themeColor = usePreferencesStore((state) => state.themeColor)

	useEffect(() => {
		Uniwind.setTheme(resolveUniwindTheme(theme))
	}, [theme])

	useEffect(() => {
		const colors = themeColorMap[themeColor]

		Uniwind.updateCSSVariables('light', {
			'--color-primary': colors.light,
			'--color-secondary': colors.light,
			'--color-primary-background': `${colors.light}15`
		})
		Uniwind.updateCSSVariables('dark', {
			'--color-primary': colors.dark,
			'--color-secondary': colors.dark,
			'--color-primary-background': `${colors.dark}25`
		})
	}, [themeColor])
}
