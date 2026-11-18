import { toast } from 'burnt'
import { selectionAsync } from 'expo-haptics'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import MultiSectionRadio from '@/components/Food/food-language-section'
import AccentColorPicker, {
	type AccentOption
} from '@/components/Theme/accent-color-picker'
import ThemePreview from '@/components/Theme/theme-preview'
import SectionView from '@/components/Universal/sections-view'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { useMemberStore } from '@/hooks/useMemberStore'
import {
	type ThemeColor,
	usePreferencesStore
} from '@/hooks/usePreferencesStore'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'

export default function Theme(): React.JSX.Element {
	const theme = usePreferencesStore((state) => state.theme)
	const setTheme = usePreferencesStore((state) => state.setTheme)
	const headerPadding = useTransparentHeaderPadding()
	const themeColor = usePreferencesStore((s) => s.themeColor)
	const setThemeColor = usePreferencesStore((s) => s.setThemeColor)
	const accentUnlocked = usePreferencesStore((s) => s.accentUnlocked)
	const memberInfo = useMemberStore((s) => s.info)
	const showSplashScreen = usePreferencesStore(
		(state) => state.showSplashScreen
	)
	const setShowSplashScreen = usePreferencesStore(
		(state) => state.setShowSplashScreen
	)
	const { t } = useTranslation(['settings', 'timetable'])

	const onSelectThemeColor = (color: ThemeColor) => {
		void selectionAsync()
		setThemeColor(color)
	}

	const onLockedAccentPress = (option: AccentOption): void => {
		void selectionAsync()
		if (option.key === 'orange') {
			toast({
				title: t('theme.accent.lockedFeedbackToast'),
				preset: 'none',
				duration: 2.5,
				from: 'top'
			})
			router.navigate('/feedback')
			return
		}

		toast({
			title: t('theme.accent.lockedMemberToast'),
			preset: 'none',
			duration: 2.5,
			from: 'top'
		})
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

	const isMember = memberInfo != null
	const accentOptions: AccentOption[] = [
		{
			key: 'blue',
			title: t('theme.accent.blue'),
			unlocked: true
		},
		{
			key: 'green',
			title: t('theme.accent.green'),
			unlocked: isMember,
			lockHint: t('theme.accent.lockedMember')
		},
		{
			key: 'purple',
			title: t('theme.accent.purple'),
			unlocked: isMember,
			lockHint: t('theme.accent.lockedMember')
		},
		{
			key: 'orange',
			title: t('theme.accent.orange'),
			unlocked: accentUnlocked,
			lockHint: t('theme.accent.lockedFeedback')
		}
	]

	return (
		<ScrollView
			testID="theme-screen"
			className="flex-1 bg-background"
			style={{ paddingTop: headerPadding }}
		>
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

			<SectionView title={t('theme.accent.title')}>
				<AccentColorPicker
					options={accentOptions}
					selected={themeColor}
					onSelect={onSelectThemeColor}
					onLockedPress={onLockedAccentPress}
				/>
			</SectionView>
			<View className="mx-page mt-[42px]">
				<Text className="text-label-secondary text-[13px] font-normal mb-1.5 mt-4 uppercase">
					{t('timetable:preferences.preview')}
				</Text>
				<ThemePreview theme={theme ?? 'auto'} onThemeChange={setTheme} />
			</View>
		</ScrollView>
	)
}
