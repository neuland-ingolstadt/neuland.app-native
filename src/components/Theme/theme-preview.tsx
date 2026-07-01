import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme, View } from 'react-native'
import ThemePreviewCard from './theme-preview-card'

interface ThemePreviewProps {
	theme: string
	onThemeChange: (theme: string) => void
}

const ThemePreview = ({
	theme,
	onThemeChange
}: ThemePreviewProps): React.JSX.Element => {
	const { t } = useTranslation('settings')
	const systemTheme = useColorScheme() ?? 'light'
	const actualTheme = theme === 'auto' ? systemTheme : theme

	const handlePress = (isDark: boolean) => {
		const newTheme = isDark ? 'dark' : 'light'
		if (newTheme !== actualTheme) {
			onThemeChange(newTheme)
		}
	}

	return (
		<View className="w-full max-w-[1100px] self-center mx-page p-3 bg-card rounded-lg mb-4">
			<View className="h-[140px] rounded-md overflow-hidden bg-card-contrast">
				<View className="flex-1 flex-row gap-3 p-3">
					<ThemePreviewCard
						isDark={false}
						isActive={actualTheme === 'light'}
						label={t('theme.themes.light')}
						onPress={() => handlePress(false)}
					/>
					<ThemePreviewCard
						isDark={true}
						isActive={actualTheme === 'dark'}
						label={t('theme.themes.dark')}
						onPress={() => handlePress(true)}
					/>
				</View>
			</View>
		</View>
	)
}

export default ThemePreview
