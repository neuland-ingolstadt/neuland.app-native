import { HeaderTitle } from '@react-navigation/elements'
import { Stack } from 'expo-router'
import { Platform, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

export function useMealDetailScroll(): {
	scrollHandler: ReturnType<typeof useAnimatedScrollHandler>
	headerStyle: ReturnType<typeof useAnimatedStyle>
} {
	const scrollOffset = useSharedValue(0)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = event.contentOffset.y
			}
		}
	})

	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	return { scrollHandler, headerStyle }
}

interface MealDetailStackHeaderProps {
	title: string
	headerStyle: ReturnType<typeof useAnimatedStyle>
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
