import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import type React from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import type { SearchBarProps } from 'react-native-screens'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

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

function WorkaroundStack({
	name,
	titleKey,
	component,
	largeTitle = false,
	headerRightElement = undefined,
	headerLeftElement = undefined,
	headerSearchBarOptions = undefined,
	params = {},
	androidFallback = false,
	freezeOnBlur = false
}: WorkaroundStackProps): React.JSX.Element {
	const { t } = useTranslation('navigation')
	const Stack = createNativeStackNavigator()
	const StackAndroid = createStackNavigator()
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	if (Platform.OS !== 'ios' && androidFallback) {
		return (
			<StackAndroid.Navigator>
				<StackAndroid.Screen
					name={name}
					component={component}
					options={{
						freezeOnBlur,
						title: t(titleKey as never),
						cardStyle: { backgroundColor },
						headerRight: headerRightElement,
						headerLeft: headerLeftElement,
						headerStyle: { backgroundColor: cardColor },
						headerTitleStyle: { color: textColor }
					}}
					initialParams={params}
				/>
			</StackAndroid.Navigator>
		)
	}
	const transparent =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
	return (
		<Stack.Navigator>
			<Stack.Screen
				name={name}
				options={{
					freezeOnBlur,
					title: t(titleKey as never),
					headerShown: true,
					headerLargeTitle: Platform.OS === 'ios' && largeTitle,
					headerRight: headerRightElement,
					headerLeft: headerLeftElement,
					contentStyle: { backgroundColor },
					headerSearchBarOptions,
					headerTintColor: primaryColor,
					headerTitleStyle: { color: textColor },
					headerStyle: {
						backgroundColor: transparent ? undefined : cardColor
					},
					headerShadowVisible: true,
					headerTransparent: transparent
				}}
				component={component}
				initialParams={params}
			/>
		</Stack.Navigator>
	)
}

export default WorkaroundStack
