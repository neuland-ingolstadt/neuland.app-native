import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import MultiSectionRadio from '@/components/Food/food-language-section'
import AccentColorPicker from '@/components/Theme/AccentColorPicker'
import ThemePreview from '@/components/Theme/ThemePreview'
import SectionView from '@/components/Universal/sections-view'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { useMemberStore } from '@/hooks/useMemberStore'
import {
	type ThemeColor,
	usePreferencesStore
} from '@/hooks/usePreferencesStore'

export default function Theme(): React.JSX.Element {
	const theme = usePreferencesStore((state) => state.theme)
	const setTheme = usePreferencesStore((state) => state.setTheme)
	const themeColor = usePreferencesStore((s) => s.themeColor)
	const setThemeColor = usePreferencesStore((s) => s.setThemeColor)
	const memberInfo = useMemberStore((s) => s.info)
	const showSplashScreen = usePreferencesStore(
		(state) => state.showSplashScreen
	)
	const setShowSplashScreen = usePreferencesStore(
		(state) => state.setShowSplashScreen
	)
	const { t } = useTranslation(['settings', 'timetable'])
	const { styles } = useStyles(stylesheet)

	const onSelectThemeColor = (color: ThemeColor) => {
		selectionAsync()
		setThemeColor(color)
	}

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

	const accentOptions: { key: ThemeColor; title: string }[] = [
		{ key: 'blue', title: t('theme.accent.blue') },
		{ key: 'green', title: t('theme.accent.green') },
		{ key: 'purple', title: t('theme.accent.purple') }
	]

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{Platform.OS !== 'web' && (
				<SectionView title={t('settings:theme.splash.title')}>
					<SingleSectionPicker
						title={t('settings:theme.splash.showSplash')}
						selectedItem={showSplashScreen}
						action={setShowSplashScreen}
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

			{memberInfo && (
				<SectionView
					title={t('theme.accent.title')}
					footer={memberInfo ? t('theme.accent.memberOnly') : undefined}
				>
					<AccentColorPicker
						options={accentOptions}
						selected={themeColor}
						onSelect={onSelectThemeColor}
					/>
				</SectionView>
			)}
			<View style={styles.preview}>
				<Text style={styles.previewLabel}>
					{t('timetable:preferences.preview')}
				</Text>
				<ThemePreview theme={theme ?? 'auto'} onThemeChange={setTheme} />
			</View>
		</ScrollView>
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
