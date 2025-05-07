import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useBottomTabBarHeight as _useBottomTabBarHeight } from 'react-native-bottom-tabs'
import { useStyles } from 'react-native-unistyles'

import PlatformIcon from '@/components/Universal/Icon'
import { BottomTabBar } from '@react-navigation/bottom-tabs'
import { Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SettingsTabButton } from '../Settings/TabButton'
import { Tabs } from './NativeBottomTabs'

import type { BottomTabBarProps } from '@bottom-tabs/react-navigation'

export const useBottomTabBarHeight = _useBottomTabBarHeight

const CustomTabBar = (props: BottomTabBarProps) => {
	const insets = useSafeAreaInsets()
	// @ts-expect-error internally correct
	return <BottomTabBar insets={insets} {...props} />
}

export default function TabLayout(): React.JSX.Element {
	const { theme } = useStyles()
	const { t } = useTranslation('navigation')
	const isAndroid = Platform.OS === 'android'
	const isMobile = Dimensions.get('window').width < 900
	const isPad = Dimensions.get('window').width < 1300
	return (
		<Tabs
			tabBar={CustomTabBar}
			screenOptions={{
				tabBarActiveTintColor: theme.colors.text,
				// @ts-expect-error internally correct
				tabBarInactiveTintColor: theme.colors.tabbarInactive,
				tabBarStyle: {
					paddingTop: 8,
					backgroundColor: theme.colors.card,
					borderColor: theme.colors.border
				},
				tabBarShowLabel: !isMobile,
				tabBarLabelPosition: isMobile
					? undefined
					: isPad
						? 'below-icon'
						: 'beside-icon'
			}}
			disablePageAnimations={isAndroid}
			translucent
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
								size: size + 2,
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
								size: size + 2,
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
								size: size + 2,
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
								size: size + 2,
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
