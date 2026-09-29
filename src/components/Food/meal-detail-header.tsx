import { Stack } from 'expo-router'
import { HeaderTitle } from 'expo-router/react-navigation'
import type { ViewStyle } from 'react-native'
import { Platform, View } from 'react-native'
import Animated, { type useAnimatedStyle } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface MealDetailStackHeaderProps {
	title: string
	headerStyle: ReturnType<typeof useAnimatedStyle<ViewStyle>>
}

export function MealDetailStackHeader({
	title,
	headerStyle
}: MealDetailStackHeaderProps): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))

	return (
		<Stack.Screen
			options={{
				headerTitle: (props) => (
					<View
						className="overflow-hidden"
						style={{
							marginBottom: Platform.OS === 'ios' ? -10 : 0,
							paddingRight: Platform.OS === 'ios' ? 0 : 50
						}}
					>
						<Animated.View style={headerStyle}>
							<HeaderTitle {...props} tintColor={String(textColor)}>
								{title}
							</HeaderTitle>
						</Animated.View>
					</View>
				)
			}}
		/>
	)
}
