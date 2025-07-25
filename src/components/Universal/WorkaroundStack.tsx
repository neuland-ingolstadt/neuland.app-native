import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import type React from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import type { SearchBarProps } from 'react-native-screens'
import {
	createStyleSheet,
	UnistylesRuntime,
	useStyles
} from 'react-native-unistyles'

export interface WorkaroundStackProps {
	name: string
	titleKey: string
	// biome-ignore lint/suspicious/noExplicitAny: TODO
	component: React.ComponentType<any>
	transparent?: boolean
	largeTitle?: boolean
	headerSearchBarOptions?: SearchBarProps
	headerLeftElement?: ((props: unknown) => ReactNode) | undefined
	headerRightElement?: ((props: unknown) => ReactNode) | undefined
	headerTransparent?: boolean
	params?: Partial<object | undefined>
	androidFallback?: boolean
	freezeOnBlur?: boolean
}
/*
 * This is a generic stack used as workaround for missing or broken features in expo-router or bottom-tabs.
 * It can be used as a drop-in replacement for the native stack navigator.
 */
function WorkaroundStack({
	name,
	titleKey,
	component,
	transparent = false,
	largeTitle = false,
	headerRightElement = undefined,
	headerLeftElement = undefined,
	headerTransparent = true,

	headerSearchBarOptions = undefined,
	params = {},
	androidFallback = false,
	freezeOnBlur = false
}: WorkaroundStackProps): React.JSX.Element {
	const { t } = useTranslation('navigation')
	const Stack = createNativeStackNavigator()
	const StackAndroid = createStackNavigator()
	const { styles, theme } = useStyles(stylesheet)
	if (Platform.OS !== 'ios' && androidFallback) {
		return (
			<StackAndroid.Navigator>
				<StackAndroid.Screen
					name={name}
					component={component}
					options={{
						freezeOnBlur: freezeOnBlur,
						title: t(
							// @ts-expect-error Type not checked
							titleKey
						),
						cardStyle: { backgroundColor: theme.colors.background },
						headerRight: headerRightElement,
						headerLeft: headerLeftElement,
						headerStyle: {
							backgroundColor: styles.headerBackground.backgroundColor
						},
						headerTitleStyle: { color: theme.colors.text }
					}}
					initialParams={params}
				/>
			</StackAndroid.Navigator>
		)
	}
	return (
		<Stack.Navigator>
			<Stack.Screen
				name={name}
				options={{
					freezeOnBlur: freezeOnBlur,
					title: t(
						// @ts-expect-error Type not checked
						titleKey
					),
					headerShown: true,
					headerLargeTitle: Platform.OS === 'ios' && largeTitle,
					headerRight: headerRightElement,
					headerLeft: headerLeftElement,
					headerLargeStyle: styles.headerBackground,
					headerSearchBarOptions,
					headerTintColor: theme.colors.primary,
					contentStyle: styles.background,
					headerTitleStyle: {
						color: theme.colors.text
					},
					headerStyle: {
						backgroundColor: styles.headerBackground.backgroundColor
					},
					headerShadowVisible: transparent,
					headerTransparent: headerTransparent,
					headerBlurEffect: UnistylesRuntime.themeName
				}}
				component={component}
				initialParams={params}
			/>
		</Stack.Navigator>
	)
}
const stylesheet = createStyleSheet((theme) => ({
	background: { backgroundColor: theme.colors.background },
	headerBackground: { backgroundColor: theme.colors.card }
}))
export default WorkaroundStack
