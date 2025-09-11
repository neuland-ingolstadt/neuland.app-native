import { Icon, Label } from 'expo-router/build/native-tabs/common/elements'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useBottomTabBarHeight as _useBottomTabBarHeight } from 'react-native-bottom-tabs'
import { useStyles } from 'react-native-unistyles'

export const useBottomTabBarHeight = _useBottomTabBarHeight

export default function TabLayout(): React.JSX.Element {
	const { theme } = useStyles()
	const { t } = useTranslation('navigation')

	return (
		<NativeTabs
			// Shared styling
			badgeBackgroundColor={theme.colors.primary}
			iconColor={theme.colors.tabbarInactive}
			tintColor={theme.colors.primary}
			indicatorColor={theme.colors.primary}
			backgroundColor={theme.colors.card}
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
