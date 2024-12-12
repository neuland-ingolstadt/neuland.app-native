import React, { useEffect } from 'react'
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'

/**
 * Animated text component that changes color between two colors.
 * @param {Colors} colors - The colors to interpolate between.
 * @param {number} speed - The speed of the animation.
 * @param {string} text - The text to display.
 * @param {TextStyle} textStyles - The styles to apply to the text.
 * @param {boolean} disabled - Whether the animation is disabled.
 * @returns {JSX.Element} - A React component that renders the animated text.
 */
const AnimatedText = ({
    speed,
    text,
    textStyles,
    disabled = false,
}: {
    speed: number
    text: string
    textStyles: any
    disabled?: boolean
}): JSX.Element => {
    const colorValue = useSharedValue(0)
    const { theme } = useStyles()
    useEffect(() => {
        if (!disabled) {
            colorValue.value = withRepeat(
                withTiming(1, {
                    duration: speed,
                    easing: Easing.linear,
                }),
                -1,
                true
            )
        } else {
            colorValue.value = 0 // Reset to initial value if disabled
        }
    }, [colorValue, speed, disabled])

    const animatedStyle = useAnimatedStyle(() => {
        const interpolatedColor = interpolateColor(
            colorValue.value,
            [0, 1],
            [theme.colors.text, theme.colors.labelSecondaryColor] // Interpolating between text and secondary label colors
        )
        return {
            color: interpolatedColor,
        }
    })

    return (
        <Animated.Text style={[animatedStyle, textStyles]}>
            {text}
        </Animated.Text>
    )
}

export default AnimatedText
