import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'

interface UseSharedPlateAnimationsProps {
	size: number
	enableTapAnimations?: boolean
}

export const useSharedPlateAnimations = ({
	size,
	enableTapAnimations = false
}: UseSharedPlateAnimationsProps) => {
	// Plate animation values
	const plateScale = useSharedValue(0.9)
	const plateOpacity = useSharedValue(0)
	const plateGlowIntensity = useSharedValue(0)
	const plateLift = useSharedValue(0)

	// Food icons animation values
	const icon0Opacity = useSharedValue(0)
	const icon0Scale = useSharedValue(0.6)
	const icon0FloatY = useSharedValue(0)
	const icon0Rotation = useSharedValue(Math.random() * 0.05 - 0.025)

	const icon1Opacity = useSharedValue(0)
	const icon1Scale = useSharedValue(0.6)
	const icon1FloatY = useSharedValue(0)
	const icon1Rotation = useSharedValue(Math.random() * 0.05 - 0.025)

	const icon2Opacity = useSharedValue(0)
	const icon2Scale = useSharedValue(0.6)
	const icon2FloatY = useSharedValue(0)
	const icon2Rotation = useSharedValue(Math.random() * 0.05 - 0.025)

	// Tap animation values (only used when enableTapAnimations is true)
	const platePressPulse = useSharedValue(0)
	const plateRotation = useSharedValue(0)
	const isAnimatingTap = useSharedValue(false)
	const innerPlateColorIntensity = useSharedValue(0)

	// Start animations on mount
	useEffect(() => {
		// Plate entrance animation
		plateOpacity.value = withTiming(1, {
			duration: 1000,
			easing: Easing.out(Easing.quad)
		})
		plateScale.value = withTiming(1, {
			duration: 1000,
			easing: Easing.out(Easing.quad)
		})

		// Continuous plate lift
		plateLift.value = withRepeat(
			withSequence(
				withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		// Continuous plate glow
		plateGlowIntensity.value = withRepeat(
			withSequence(
				withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
				withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
			),
			-1,
			true
		)

		// Animate each food icon
		// Icon 0
		icon0Opacity.value = withDelay(
			0,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		icon0Scale.value = withDelay(
			0,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		icon0FloatY.value = withRepeat(
			withSequence(
				withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
		icon0Rotation.value = withRepeat(
			withSequence(
				withTiming(0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
				withTiming(-0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		// Icon 1
		icon1Opacity.value = withDelay(
			400,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		icon1Scale.value = withDelay(
			400,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		icon1FloatY.value = withRepeat(
			withSequence(
				withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
		icon1Rotation.value = withRepeat(
			withSequence(
				withTiming(0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
				withTiming(-0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		// Icon 2
		icon2Opacity.value = withDelay(
			800,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		icon2Scale.value = withDelay(
			800,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		icon2FloatY.value = withRepeat(
			withSequence(
				withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
		icon2Rotation.value = withRepeat(
			withSequence(
				withTiming(0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
				withTiming(-0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
	}, [])

	// Plate animated styles
	const plateAnimatedStyle = useAnimatedStyle(() => {
		const tapScale = enableTapAnimations ? 1 - platePressPulse.value * 0.05 : 1

		return {
			transform: [
				{ scale: plateScale.value * tapScale },
				{ translateY: plateLift.value },
				{ rotate: enableTapAnimations ? `${plateRotation.value}rad` : '0rad' }
			],
			opacity: plateOpacity.value,
			shadowOpacity: 0.25 + plateGlowIntensity.value * 0.15
		}
	})

	const plateInnerAnimatedStyle = useAnimatedStyle(() => {
		return {
			shadowOpacity: 0.15 + plateGlowIntensity.value * 0.1,
			backgroundColor: enableTapAnimations
				? `rgba(0, 122, 255, ${innerPlateColorIntensity.value * 0.3})`
				: undefined
		}
	})

	// Individual icon animated styles
	const icon0Style = useAnimatedStyle(() => {
		const baseSize = size * 0.75
		return {
			opacity: icon0Opacity.value,
			transform: [
				{ translateX: baseSize * 0.8 },
				{ translateY: baseSize * -0.6 + icon0FloatY.value },
				{ scale: icon0Scale.value },
				{ rotate: `${icon0Rotation.value}rad` }
			]
		}
	})

	const icon1Style = useAnimatedStyle(() => {
		const baseSize = size * 0.75
		return {
			opacity: icon1Opacity.value,
			transform: [
				{ translateX: baseSize * -0.85 },
				{ translateY: baseSize * -0.45 + icon1FloatY.value },
				{ scale: icon1Scale.value },
				{ rotate: `${icon1Rotation.value}rad` }
			]
		}
	})

	const icon2Style = useAnimatedStyle(() => {
		const baseSize = size * 0.75
		return {
			opacity: icon2Opacity.value,
			transform: [
				{ translateX: baseSize * 0.45 },
				{ translateY: baseSize * 0.9 + icon2FloatY.value },
				{ scale: icon2Scale.value },
				{ rotate: `${icon2Rotation.value}rad` }
			]
		}
	})

	// Tap animation functions (only used when enableTapAnimations is true)
	const triggerTapAnimation = () => {
		'worklet'

		if (!enableTapAnimations) return

		// Trigger haptic feedback on JS thread
		runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)

		isAnimatingTap.value = true
		platePressPulse.value = withSequence(
			withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
		)

		plateRotation.value = withSequence(
			withTiming(-0.03, { duration: 200, easing: Easing.inOut(Easing.quad) }),
			withTiming(0.03, { duration: 400, easing: Easing.inOut(Easing.quad) }),
			withTiming(
				0,
				{ duration: 300, easing: Easing.inOut(Easing.quad) },
				(finished) => {
					if (finished) {
						isAnimatingTap.value = false
					}
				}
			)
		)

		plateGlowIntensity.value = withSequence(
			withTiming(1.5, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(0.3, { duration: 800, easing: Easing.out(Easing.quad) })
		)

		// Inner plate color animation on tap
		innerPlateColorIntensity.value = withSequence(
			withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
		)

		// Make icons jump in response to tap
		icon0FloatY.value = withSequence(
			withTiming(-5, { duration: 200, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
		)
		icon1FloatY.value = withSequence(
			withTiming(-5, { duration: 200, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
		)
		icon2FloatY.value = withSequence(
			withTiming(-5, { duration: 200, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
		)
	}

	return {
		// Animated styles
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		icon0Style,
		icon1Style,
		icon2Style,

		// Tap animation function
		triggerTapAnimation,

		// Shared values (for advanced usage)
		plateScale,
		plateOpacity,
		plateGlowIntensity,
		plateLift,
		platePressPulse,
		plateRotation,
		isAnimatingTap,
		innerPlateColorIntensity,
		icon0Opacity,
		icon0Scale,
		icon0FloatY,
		icon0Rotation,
		icon1Opacity,
		icon1Scale,
		icon1FloatY,
		icon1Rotation,
		icon2Opacity,
		icon2Scale,
		icon2FloatY,
		icon2Rotation
	}
}
