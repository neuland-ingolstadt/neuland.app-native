import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ThemePreviewCard from './ThemePreviewCard'

interface ThemePreviewProps {
	theme: string
	onThemeChange: (theme: string) => void
}

const ThemePreview = ({
	theme,
	onThemeChange
}: ThemePreviewProps): React.JSX.Element => {
	const { styles } = useStyles(previewStylesheet)
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
		<View style={styles.container}>
			<View style={styles.previewContainer}>
				<View style={styles.previewsRow}>
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

const previewStylesheet = createStyleSheet((theme) => ({
	container: {
		width: '100%',
		maxWidth: 1100,
		alignSelf: 'center',
		marginHorizontal: theme.margins.page,
		padding: 12,
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.lg,
		marginBottom: 16
	},
	previewContainer: {
		height: 140,
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		backgroundColor: theme.colors.cardContrast
	},
	previewsRow: {
		flex: 1,
		flexDirection: 'row',
		gap: 12,
		padding: 12
	}
}))

export default ThemePreview
