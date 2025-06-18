import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import MultiSectionRadio from '@/components/Food/FoodLanguageSection'
import ThemePreview from '@/components/Theme/ThemePreview'
import SectionView from '@/components/Universal/SectionsView'
import SingleSectionPicker from '@/components/Universal/SingleSectionPicker'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'

export default function Theme(): React.JSX.Element {
	const theme = usePreferencesStore((state) => state.theme)
	const setTheme = usePreferencesStore((state) => state.setTheme)
	const showSplashScreen = usePreferencesStore(
		(state) => state.showSplashScreen
	)
	const setShowSplashScreen = usePreferencesStore(
		(state) => state.setShowSplashScreen
	)
	const { t } = useTranslation(['settings', 'timetable'])
	const { styles } = useStyles(stylesheet)

	const elements = [
		{
			key: 'auto',
			title: t('theme.themes.default')
		},
		{
			key: 'light',
			title: t('theme.themes.light')
		},
		{
			key: 'dark',
			title: t('theme.themes.dark')
		}
	]

	return (
		<View style={styles.container}>
			{Platform.OS !== 'web' && (
				<SectionView title={t('settings:theme.splash.title')}>
					<SingleSectionPicker
						title={t('settings:theme.splash.showSplash')}
						selectedItem={showSplashScreen}
						action={setShowSplashScreen}
						state={showSplashScreen}
					/>
				</SectionView>
			)}
			<SectionView
				title={t('theme.themes.title')}
				footer={t('theme.themes.footer')}
			>
				<MultiSectionRadio
					elements={elements}
					selectedItem={theme ?? 'auto'}
					action={setTheme as (item: string) => void}
				/>
			</SectionView>

			<View style={styles.preview}>
				<Text style={styles.previewLabel}>
					{t('timetable:preferences.preview')}
				</Text>
				<ThemePreview theme={theme ?? 'auto'} onThemeChange={setTheme} />
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background
	},
	preview: {
		marginHorizontal: theme.margins.page,
		marginTop: 42
	},
	previewLabel: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		marginBottom: 6,
		marginTop: 16,
		textTransform: 'uppercase'
	}
}))
