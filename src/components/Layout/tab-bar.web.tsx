import { Tabs } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { SettingsTabButton } from '../Settings/tab-button'

export function useBottomTabBarHeight(): number {
	return 60
}

const TabLayout = (): React.JSX.Element => {
	'use no memo'
	const { theme: styleTheme } = useStyles()
	const { t } = useTranslation('navigation')
	const isMobile = Dimensions.get('window').width < 900
	const isPad = Dimensions.get('window').width < 1300

	return (
		<Tabs
			screenOptions={{
				tabBarPosition: isMobile ? 'bottom' : 'left',
				tabBarActiveTintColor: styleTheme.colors.primary,
				tabBarActiveBackgroundColor: styleTheme.colors.primaryBackground,
				tabBarInactiveTintColor: styleTheme.colors.labelColor,
				tabBarStyle: {
					backgroundColor: styleTheme.colors.card
				},
				tabBarIconStyle: {
					marginTop: isMobile ? 4 : 0
				},
				tabBarLabelStyle: {
					paddingTop: isPad ? 4 : 0
				},
				tabBarShowLabel: !isMobile,
				tabBarLabelPosition: isMobile
					? undefined
					: isPad
						? 'below-icon'
						: 'beside-icon',
				tabBarVariant: isMobile ? 'uikit' : 'material'
			}}
		>
			<Tabs.Screen
				name="(index)"
				options={{
					title: 'Home',
					headerShown: false,
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'house',
								variant: focused ? 'fill' : 'outline',
								size: size
							}}
							android={{
								name: 'home',
								size
							}}
							web={{
								name: 'House',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>

			<Tabs.Screen
				name="timetable"
				options={{
					headerShown: Platform.OS === 'web',
					title: t('navigation.timetable'),
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'clock',
								variant: focused ? 'fill' : 'outline',

								size: size
							}}
							android={{
								name: 'calendar_month',
								size
							}}
							web={{
								name: 'Clock',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>

			<Tabs.Screen
				name="map"
				options={{
					title: t('navigation.map'),
					headerShown: false,
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'map',
								size: size,
								variant: focused ? 'fill' : 'outline'
							}}
							android={{
								name: 'map',
								size
							}}
							web={{
								name: 'Map',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>

			<Tabs.Screen
				name="food"
				options={{
					title: t('navigation.food'),
					headerShown: Platform.OS === 'web',
					tabBarLabel: t('navigation.food'),
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'fork.knife',
								variant: focused ? 'fill' : 'outline',

								size: size
							}}
							android={{
								name: 'restaurant',
								size
							}}
							web={{
								name: 'Utensils',
								size: size - 2
							}}
							style={{
								color
							}}
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
					tabBarIcon: ({ color, size, focused }) => (
						<SettingsTabButton color={color} size={size} focused={focused} />
					)
				}}
			/>
		</Tabs>
	)
}

export default TabLayout
