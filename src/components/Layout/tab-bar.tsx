import Color from 'color'
import { Icon, Label } from 'expo-router/build/native-tabs/common/elements'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, useColorScheme } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { toColor } from '@/utils/uniwind-utils'

function resolveActiveTheme(
	theme: string,
	colorScheme: 'light' | 'dark' | null | undefined
): 'light' | 'dark' {
	if (theme === 'light' || theme === 'dark') {
		return theme
	}

	return colorScheme === 'dark' ? 'dark' : 'light'
}

export default function TabLayout(): React.JSX.Element {
	const themePreference = usePreferencesStore((state) => state.theme)
	const colorScheme = useColorScheme()
	const isDark = resolveActiveTheme(themePreference, colorScheme) === 'dark'
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const tabbarInactiveColor = String(
		toColor(useCSSVariable('--color-tabbar-inactive')) ?? '#999999'
	)
	const { t } = useTranslation('navigation')
	const isIos26 =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
	const isAndroid = Platform.OS === 'android'
	const androidIndicatorColor = isDark
		? Color(cardColor)
				.mix(Color(primaryColor), 0.06)
				.lighten(1.4)
				.saturate(1)
				.hex()
		: Color(cardColor)
				.mix(Color(primaryColor), 0.3)
				.darken(0.05)
				.saturate(0.1)
				.hex()
	const androidBackgroundColor = isDark
		? Color(cardColor).mix(Color(primaryColor), 0.04).hex()
		: Color(cardColor).mix(Color(primaryColor), 0.1).hex()

	return (
		<NativeTabs
			badgeBackgroundColor={primaryColor}
			iconColor={tabbarInactiveColor}
			tintColor={primaryColor}
			indicatorColor={isAndroid ? androidIndicatorColor : undefined}
			labelVisibilityMode="labeled"
			backgroundColor={isAndroid ? androidBackgroundColor : cardColor}
			disableTransparentOnScrollEdge={!isIos26}
		>
			<NativeTabs.Trigger name="index">
				<Label>{t('navigation.home')}</Label>
				{Platform.OS === 'ios' ? (
					<Icon
						sf={{ default: 'house', selected: 'house.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<Icon
						src={{
							default: require('../../assets/tabbar/home.svg'),
							selected: require('../../assets/tabbar/home_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="timetable">
				<Label>{t('navigation.timetable')}</Label>
				{Platform.OS === 'ios' ? (
					<Icon
						sf={{ default: 'clock', selected: 'clock.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<Icon
						src={{
							default: require('../../assets/tabbar/calendar_month.svg'),
							selected: require('../../assets/tabbar/calendar_month_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="map">
				<Label>{t('navigation.map')}</Label>
				{Platform.OS === 'ios' ? (
					<Icon
						sf={{ default: 'map', selected: 'map.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<Icon
						src={{
							default: require('../../assets/tabbar/map.svg'),
							selected: require('../../assets/tabbar/map_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="food">
				<Label>{t('navigation.food')}</Label>
				{Platform.OS === 'ios' ? (
					<Icon
						sf={{ default: 'fork.knife', selected: 'fork.knife' }}
						selectedColor={primaryColor}
					/>
				) : (
					<Icon
						src={{
							default: require('../../assets/tabbar/food.svg'),
							selected: require('../../assets/tabbar/food_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="settings">
				<Label>{t('navigation.profile')}</Label>
				{Platform.OS === 'ios' ? (
					<Icon
						sf={{ default: 'person', selected: 'person.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<Icon
						src={{
							default: require('../../assets/tabbar/account_circle.svg'),
							selected: require('../../assets/tabbar/account_circle_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
		</NativeTabs>
	)
}
