import type { ThemeColor } from '@/hooks/usePreferencesStore'
import { darkTheme, lightTheme } from '@/styles/themes'

export const themeColorMap: Record<
	ThemeColor,
	{ light: string; dark: string }
> = {
	blue: { light: lightTheme.colors.primary, dark: darkTheme.colors.primary },
	green: { light: '#2d9e66', dark: '#24ff88' },
	purple: { light: '#990eda', dark: '#9e10f0' }
}
