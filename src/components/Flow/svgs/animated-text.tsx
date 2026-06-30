import type React from 'react'
import { useEffect } from 'react'
import type { TextStyle } from 'react-native'
import Animated, {
	Easing,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

/**
 * Animated text component that changes color between two colors.
 */
const AnimatedText = ({
	speed,
	text,
	textStyles,
	disabled = false
}: {
	speed: number
	text: string
	textStyles: TextStyle
	disabled?: boolean
}): React.JSX.Element => {
	const colorValue = useSharedValue(0)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')
	const labelSecondaryColor = String(
		toColor(useCSSVariable('--color-label-secondary')) ?? '#777778'
	)

	useEffect(() => {
		if (!disabled) {
			colorValue.value = withRepeat(
				withTiming(1, {
					duration: speed,
					easing: Easing.linear
				}),
				-1,
				true
			)
		} else {
			colorValue.value = 0
		}
	}, [colorValue, speed, disabled])

	const animatedStyle = useAnimatedStyle(() => {
		const interpolatedColor = interpolateColor(
			colorValue.value,
			[0, 1],
			[textColor, labelSecondaryColor]
		)
		return {
			color: interpolatedColor
		}
	})

	return (
		<Animated.Text style={[animatedStyle, textStyles]}>{text}</Animated.Text>
	)
}

export default AnimatedText
