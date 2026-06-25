import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import {
	Easing,
	interpolateColor,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'

interface UseSharedPlateAnimationsProps {
	enableTapAnimations?: boolean
	baseInnerColor: string
	tapTintColor?: string
}

export const useSharedPlateAnimations = ({
	enableTapAnimations = false,
	baseInnerColor,
	tapTintColor = '#007aff'
}: UseSharedPlateAnimationsProps) => {
	const plateScale = useSharedValue(0.9)
	const plateOpacity = useSharedValue(0)
	const plateGlowIntensity = useSharedValue(0)
	const plateLift = useSharedValue(0)
	const platePressPulse = useSharedValue(0)
	const plateRotation = useSharedValue(0)
	const isAnimatingTap = useSharedValue(false)
	const innerPlateColorIntensity = useSharedValue(0)
	const tapCount = useSharedValue(0)

	useEffect(() => {
		plateOpacity.value = withTiming(1, {
			duration: 1000,
			easing: Easing.out(Easing.quad)
		})
		plateScale.value = withTiming(1, {
			duration: 1000,
			easing: Easing.out(Easing.quad)
		})

		plateLift.value = withRepeat(
			withSequence(
				withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		plateGlowIntensity.value = withRepeat(
			withSequence(
				withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
				withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
			),
			-1,
			true
		)
	}, [])

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
		if (enableTapAnimations) {
			const progress = Math.max(
				0,
				Math.min(0.3, innerPlateColorIntensity.value * 0.3)
			)
			const mixed = interpolateColor(
				progress,
				[0, 0.3],
				[baseInnerColor as unknown as number, tapTintColor as unknown as number]
			)
			return {
				shadowOpacity: 0.15 + plateGlowIntensity.value * 0.1,
				backgroundColor: mixed as unknown as string
			}
		}
		return {
			shadowOpacity: 0.15 + plateGlowIntensity.value * 0.1,
			backgroundColor: baseInnerColor
		}
	})

	const triggerTapAnimation = () => {
		'worklet'

		if (!enableTapAnimations) return

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

		innerPlateColorIntensity.value = withSequence(
			withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
		)

		tapCount.value = tapCount.value + 1
	}

	return {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		triggerTapAnimation,
		tapCount
	}
}
