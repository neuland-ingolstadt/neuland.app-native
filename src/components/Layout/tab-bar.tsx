import Color from 'color'
import { Icon, Label } from 'expo-router/build/native-tabs/common/elements'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { UnistylesRuntime, useStyles } from 'react-native-unistyles'

export default function TabLayout(): React.JSX.Element {
	const { theme } = useStyles()
	const { t } = useTranslation('navigation')
	const isIos26 =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
	const isAndroid = Platform.OS === 'android'
	return (
		<NativeTabs
			// Shared styling
			badgeBackgroundColor={theme.colors.primary}
			iconColor={theme.colors.tabbarInactive}
			tintColor={theme.colors.primary}
			indicatorColor={
				isAndroid
					? UnistylesRuntime.themeName === 'dark'
						? Color(theme.colors.card)
								.mix(Color(theme.colors.primary), 0.06)
								.lighten(1.4)
								.saturate(1)
								.hex()
						: Color(theme.colors.card)
								.mix(Color(theme.colors.primary), 0.3)
								.darken(0.05)
								.saturate(0.1)
								.hex()
					: undefined
			}
			labelVisibilityMode="labeled"
			backgroundColor={
				isAndroid
					? UnistylesRuntime.themeName === 'dark'
						? Color(theme.colors.card)
								.mix(Color(theme.colors.primary), 0.04)
								.hex()
						: Color(theme.colors.card)
								.mix(Color(theme.colors.primary), 0.1)
								.hex()
					: theme.colors.card
			}
			disableTransparentOnScrollEdge={!isIos26}
		>
			<NativeTabs.Trigger name="(index)">
				<Label>{'Home'}</Label>
				{Platform.OS === 'ios' ? (
					<Icon
						sf={{ default: 'house', selected: 'house.fill' }}
						selectedColor={theme.colors.primary}
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
						selectedColor={theme.colors.primary}
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
						selectedColor={theme.colors.primary}
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
						selectedColor={theme.colors.primary}
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
						selectedColor={theme.colors.primary}
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
