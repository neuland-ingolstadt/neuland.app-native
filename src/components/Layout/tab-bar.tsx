import Color from 'color'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, useColorScheme } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { resolveActiveTheme } from '@/utils/theme-utils'
import { toColor } from '@/utils/uniwind-utils'

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
				<NativeTabs.Trigger.Label>
					{t('navigation.home')}
				</NativeTabs.Trigger.Label>
				{Platform.OS === 'ios' ? (
					<NativeTabs.Trigger.Icon
						sf={{ default: 'house', selected: 'house.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<NativeTabs.Trigger.Icon
						src={{
							default: require('../../assets/tabbar/home.svg'),
							selected: require('../../assets/tabbar/home_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="timetable">
				<NativeTabs.Trigger.Label>
					{t('navigation.timetable')}
				</NativeTabs.Trigger.Label>
				{Platform.OS === 'ios' ? (
					<NativeTabs.Trigger.Icon
						sf={{ default: 'clock', selected: 'clock.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<NativeTabs.Trigger.Icon
						src={{
							default: require('../../assets/tabbar/calendar_month.svg'),
							selected: require('../../assets/tabbar/calendar_month_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="map">
				<NativeTabs.Trigger.Label>
					{t('navigation.map')}
				</NativeTabs.Trigger.Label>
				{Platform.OS === 'ios' ? (
					<NativeTabs.Trigger.Icon
						sf={{ default: 'map', selected: 'map.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<NativeTabs.Trigger.Icon
						src={{
							default: require('../../assets/tabbar/map.svg'),
							selected: require('../../assets/tabbar/map_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="food">
				<NativeTabs.Trigger.Label>
					{t('navigation.food')}
				</NativeTabs.Trigger.Label>
				{Platform.OS === 'ios' ? (
					<NativeTabs.Trigger.Icon
						sf={{ default: 'fork.knife', selected: 'fork.knife' }}
						selectedColor={primaryColor}
					/>
				) : (
					<NativeTabs.Trigger.Icon
						src={{
							default: require('../../assets/tabbar/food.svg'),
							selected: require('../../assets/tabbar/food_fill.svg')
						}}
					/>
				)}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="settings">
				<NativeTabs.Trigger.Label>
					{t('navigation.profile')}
				</NativeTabs.Trigger.Label>
				{Platform.OS === 'ios' ? (
					<NativeTabs.Trigger.Icon
						sf={{ default: 'person', selected: 'person.fill' }}
						selectedColor={primaryColor}
					/>
				) : (
					<NativeTabs.Trigger.Icon
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
