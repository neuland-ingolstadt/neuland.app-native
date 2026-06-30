import { Tabs } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'
import { SettingsTabButton } from '../Settings/tab-button'

const TabLayout = (): React.JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const primaryBackgroundColor = String(
		toColor(useCSSVariable('--color-primary-background')) ?? '#007aff15'
	)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const { t } = useTranslation('navigation')
	const isMobile = Dimensions.get('window').width < 900
	const isPad = Dimensions.get('window').width < 1300

	return (
		<Tabs
			screenOptions={{
				tabBarPosition: isMobile ? 'bottom' : 'left',
				tabBarActiveTintColor: primaryColor,
				tabBarActiveBackgroundColor: primaryBackgroundColor,
				tabBarInactiveTintColor: labelColor,
				tabBarStyle: {
					backgroundColor: cardColor
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
				name="index"
				options={{
					title: t('navigation.home'),
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
