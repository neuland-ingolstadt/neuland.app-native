import type React from 'react'
import { useEffect } from 'react'
import type { ViewStyle } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming
} from 'react-native-reanimated'

interface PulsingDotProps {
	style?: ViewStyle | ViewStyle[]
	duration?: number
	minOpacity?: number
	maxOpacity?: number
}

const PulsingDot: React.FC<PulsingDotProps> = ({
	style,
	duration = 1000,
	minOpacity = 0.3,
	maxOpacity = 1
}) => {
	const pulseOpacity = useSharedValue(minOpacity)

	useEffect(() => {
		pulseOpacity.value = withRepeat(
			withTiming(maxOpacity, { duration }),
			-1,
			true
		)
	}, [duration, maxOpacity, pulseOpacity])

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: pulseOpacity.value
	}))

	return <Animated.View style={[style, animatedStyle]} />
}

export default PulsingDot
