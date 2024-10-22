import { useMMKVString } from 'react-native-mmkv'

export const DEFAULT_ACCENT_COLOR = 'blue'

export interface ThemeHook {
    accentColor: string | undefined
    theme: string | undefined // ('light' | 'dark' | 'auto') as string
    setAccentColor: (name: string) => void
    setTheme: (theme: string) => void
}

/**
 * Custom hook that manages the theme and accent color of the app.
 * Uses AsyncStorage to persist the accent color across app sessions.
 * @returns ThemeHook object with accentColor and toggleAccentColor properties.
 */
export function useTheme(): ThemeHook {
    const [accentColor, setAccentColor] = useMMKVString('accentColor')
    const [theme, setTheme] = useMMKVString('theme')

    return {
        accentColor,
        setAccentColor,
        theme,
        setTheme,
    }
}
