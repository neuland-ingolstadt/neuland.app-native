import type React from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import Animated, {
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming
} from 'react-native-reanimated'

interface PulsingDotProps {
	style?: StyleProp<ViewStyle>
	duration?: number
	minOpacity?: number
	maxOpacity?: number
}

const PulsingDot: React.FC<PulsingDotProps> = ({
	style,
	duration = 1200,
	minOpacity = 0.3,
	maxOpacity = 1
}) => {
	const pulseOpacity = useSharedValue(minOpacity)
	const isActive = useSharedValue(true)

	useAnimatedReaction(
		() => isActive.value,
		(active) => {
			if (active) {
				pulseOpacity.value = withRepeat(
					withTiming(maxOpacity, { duration }),
					-1,
					true
				)
			}
		},
		[duration, maxOpacity]
	)

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: pulseOpacity.value
	}))

	return <Animated.View style={[style, animatedStyle]} />
}

export default PulsingDot
