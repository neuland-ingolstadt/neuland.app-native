import Color from 'color'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useBottomTabBarHeight as _useBottomTabBarHeight } from 'react-native-bottom-tabs'
import { UnistylesRuntime, useStyles } from 'react-native-unistyles'

import { Tabs } from './NativeBottomTabs'

export const useBottomTabBarHeight = _useBottomTabBarHeight

export default function TabLayout(): React.JSX.Element {
	const { theme } = useStyles()
	const { t } = useTranslation('navigation')
	const isAndroid = Platform.OS === 'android'
	return (
		<Tabs
			sidebarAdaptable={false}
			tabBarActiveTintColor={theme.colors.primary}
			tabBarStyle={{
				backgroundColor: isAndroid
					? UnistylesRuntime.themeName === 'dark'
						? Color(theme.colors.card)
								.mix(Color(theme.colors.primary), 0.04)
								.hex()
						: Color(theme.colors.card)
								.mix(Color(theme.colors.primary), 0.1)
								.hex()
					: undefined
			}}
			translucent
			tabLabelStyle={{
				fontSize: 11
			}}
			labeled
			disablePageAnimations={Platform.OS === 'android'}
			activeIndicatorColor={
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
		>
			<Tabs.Screen
				name="(index)"
				options={{
					title: 'Home',
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						isAndroid
							? focused
								? require('../../assets/tabbar/home_fill.svg')
								: require('../../assets/tabbar/home.svg')
							: { sfSymbol: 'house.fill' }
				}}
			/>
			<Tabs.Screen
				name="timetable"
				options={{
					title: t('navigation.timetable'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						isAndroid
							? focused
								? require('../../assets/tabbar/calendar_month_fill.svg')
								: require('../../assets/tabbar/calendar_month.svg')
							: { sfSymbol: 'clock.fill' }
				}}
			/>
			<Tabs.Screen
				name="map"
				options={{
					title: t('navigation.map'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						isAndroid
							? focused
								? require('../../assets/tabbar/map_fill.svg')
								: require('../../assets/tabbar/map.svg')
							: { sfSymbol: 'map.fill' }
				}}
			/>
			<Tabs.Screen
				name="food"
				options={{
					title: t('navigation.food'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						isAndroid
							? focused
								? require('../../assets/tabbar/food_fill.svg')
								: require('../../assets/tabbar/food.svg')
							: { sfSymbol: 'fork.knife' }
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: t('navigation.profile'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						isAndroid
							? focused
								? require('../../assets/tabbar/account_circle_fill.svg')
								: require('../../assets/tabbar/account_circle.svg')
							: { sfSymbol: 'person' }
				}}
			/>
		</Tabs>
	)
}
