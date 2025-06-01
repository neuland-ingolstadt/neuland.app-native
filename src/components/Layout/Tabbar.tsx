import type { BottomTabBarProps } from '@bottom-tabs/react-navigation'
import { BottomTabBar } from '@react-navigation/bottom-tabs'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useBottomTabBarHeight as _useBottomTabBarHeight } from 'react-native-bottom-tabs'
import DeviceInfo from 'react-native-device-info'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { SettingsTabButton } from '../Settings/TabButton'
import { Tabs } from './NativeBottomTabs'

export const useBottomTabBarHeight = _useBottomTabBarHeight

const CustomTabBar = (props: BottomTabBarProps) => {
	const insets = useSafeAreaInsets()
	// @ts-expect-error internally correct
	return <BottomTabBar insets={insets} {...props} />
}

export default function TabLayout(): React.JSX.Element {
	const { theme } = useStyles()
	const { t } = useTranslation('navigation')

	return (
		<Tabs
			tabBar={CustomTabBar}
			screenOptions={{
				tabBarActiveTintColor: theme.colors.text,
				// @ts-expect-error internally correct
				tabBarInactiveTintColor: theme.colors.tabbarInactive,
				tabBarStyle: {
					paddingTop: DeviceInfo.getDeviceType() === 'Desktop' ? 4 : 10,
					backgroundColor: theme.colors.card,
					borderColor: theme.colors.border
				},
				tabBarLabelPosition: 'below-icon', // somehow needed to prevent repositioning even tho the label is hidden
				tabBarShowLabel: false
			}}
		>
			<Tabs.Screen
				name="(index)"
				options={{
					title: 'Home',
					headerShown: false,
					// @ts-expect-error internally correct
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'house',
								variant: focused ? 'fill' : 'outline',
								size: size - 1
							}}
							android={{
								name: 'home',
								size: size + 3,
								variant: focused ? 'filled' : 'outlined'
							}}
							web={{ name: 'House', size: size - 2 }}
							style={{ color }}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="timetable"
				options={{
					title: t('navigation.timetable'),
					headerShown: false,
					// @ts-expect-error internally correct
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'clock',
								variant: focused ? 'fill' : 'outline',
								size: size - 1
							}}
							android={{
								name: 'calendar_month',
								size: size + 3,
								variant: focused ? 'filled' : 'outlined'
							}}
							web={{ name: 'Clock', size: size - 2 }}
							style={{ color }}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="map"
				options={{
					title: t('navigation.map'),
					headerShown: false,
					// @ts-expect-error internally correct
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'map',
								variant: focused ? 'fill' : 'outline',
								size: size - 1
							}}
							android={{
								name: 'map',
								size: size + 3,
								variant: focused ? 'filled' : 'outlined'
							}}
							web={{ name: 'Map', size: size - 2 }}
							style={{ color }}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="food"
				options={{
					title: t('navigation.food'),
					headerShown: false,
					tabBarLabel: t('navigation.food'),
					// @ts-expect-error internally correct
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'fork.knife',
								variant: focused ? 'fill' : 'outline',
								size: size - 1
							}}
							android={{
								name: 'restaurant',
								size: size + 3,
								variant: focused ? 'filled' : 'outlined'
							}}
							web={{ name: 'Utensils', size: size - 2 }}
							style={{ color }}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: t('navigation.profile'),
					headerShown: true,
					tabBarLabel: t('navigation.profile'),

					// @ts-expect-error internally correct
					tabBarIcon: ({ color, size, focused }) => (
						<SettingsTabButton
							color={color}
							size={size + (Platform.OS === 'ios' && 2)}
							focused={focused}
						/>
					)
				}}
			/>
		</Tabs>
	)
}
