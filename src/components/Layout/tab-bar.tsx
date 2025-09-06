import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export function useBottomTabBarHeight(): number {
	// For native tabs, we can return a fixed height or calculate it dynamically
	return Platform.OS === 'ios' ? 83 : 60 // iOS includes safe area
}

export default function TabLayout(): React.JSX.Element {
	const { theme } = useStyles()
	const { t } = useTranslation('navigation')

	return (
		<NativeTabs
			backgroundColor={theme.colors.card}
			tintColor={theme.colors.primary}
			labelStyle={{}}
			minimizeBehavior="onScrollDown"
		>
			<NativeTabs.Trigger name="(index)">
				<Icon
					sf={Platform.OS === 'ios' ? 'house' : undefined}
					drawable={Platform.OS === 'android' ? 'home' : undefined}
				/>
				<Label>Home</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="timetable">
				<Icon
					sf={Platform.OS === 'ios' ? 'clock' : undefined}
					drawable={Platform.OS === 'android' ? 'calendar_month' : undefined}
				/>
				<Label>{t('navigation.timetable')}</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="map">
				<Icon
					sf={Platform.OS === 'ios' ? 'map' : undefined}
					drawable={Platform.OS === 'android' ? 'map' : undefined}
				/>
				<Label>{t('navigation.map')}</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="food">
				<Icon
					sf={Platform.OS === 'ios' ? 'fork.knife' : undefined}
					drawable={Platform.OS === 'android' ? 'restaurant' : undefined}
				/>
				<Label>{t('navigation.food')}</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="settings">
				<Icon
					sf={Platform.OS === 'ios' ? 'person.circle' : undefined}
					drawable={Platform.OS === 'android' ? 'account' : undefined}
				/>
				<Label>{t('navigation.profile')}</Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	)
}
