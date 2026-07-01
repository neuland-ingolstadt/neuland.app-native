import Color from 'color'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'react-native'
import { useBottomTabBarHeight as _useBottomTabBarHeight } from 'react-native-bottom-tabs'
import { useCSSVariable } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { toColor } from '@/utils/uniwind-utils'
import { Tabs } from './native-bottom-tabs'

export const useBottomTabBarHeight = _useBottomTabBarHeight

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
	const { t } = useTranslation('navigation')
	const tabBarBackgroundColor = isDark
		? Color(cardColor).mix(Color(primaryColor), 0.04).hex()
		: Color(cardColor).mix(Color(primaryColor), 0.1).hex()
	const activeIndicatorColor = isDark
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

	return (
		<Tabs
			sidebarAdaptable={false}
			tabBarActiveTintColor={primaryColor}
			tabBarStyle={{
				backgroundColor: tabBarBackgroundColor
			}}
			translucent
			tabLabelStyle={{
				fontSize: 11
			}}
			labeled
			disablePageAnimations={true}
			activeIndicatorColor={activeIndicatorColor}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: t('navigation.home'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						focused
							? require('../../assets/tabbar/home_fill.svg')
							: require('../../assets/tabbar/home.svg')
				}}
			/>
			<Tabs.Screen
				name="timetable"
				options={{
					title: t('navigation.timetable'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						focused
							? require('../../assets/tabbar/calendar_month_fill.svg')
							: require('../../assets/tabbar/calendar_month.svg')
				}}
			/>
			<Tabs.Screen
				name="map"
				options={{
					title: t('navigation.map'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						focused
							? require('../../assets/tabbar/map_fill.svg')
							: require('../../assets/tabbar/map.svg')
				}}
			/>
			<Tabs.Screen
				name="food"
				options={{
					title: t('navigation.food'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						focused
							? require('../../assets/tabbar/food_fill.svg')
							: require('../../assets/tabbar/food.svg')
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: t('navigation.profile'),
					tabBarIcon: ({ focused }: { focused: boolean }) =>
						focused
							? require('../../assets/tabbar/account_circle_fill.svg')
							: require('../../assets/tabbar/account_circle.svg')
				}}
			/>
		</Tabs>
	)
}
