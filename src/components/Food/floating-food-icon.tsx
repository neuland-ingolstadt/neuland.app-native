import { useEffect } from 'react'
import Animated, {
	Easing,
	type SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import type { FoodIcon } from './food-icons'

interface FloatingFoodIconProps {
	foodIcon: FoodIcon
	size: number
	tapCount?: SharedValue<number>
}

export const FloatingFoodIcon = ({
	foodIcon,
	size,
	tapCount
}: FloatingFoodIconProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	const opacity = useSharedValue(0)
	const scale = useSharedValue(0.6)
	const floatY = useSharedValue(0)
	const rotation = useSharedValue(Math.random() * 0.05 - 0.025)

	useAnimatedReaction(
		() => tapCount?.value,
		(current, previous) => {
			if (tapCount == null) return
			if (previous === undefined) return
			if (current === previous) return

			floatY.value = withSequence(
				withTiming(-5, { duration: 200, easing: Easing.out(Easing.quad) }),
				withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
			)
		}
	)

	useEffect(() => {
		const delay = foodIcon.delay

		opacity.value = withDelay(
			delay,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		scale.value = withDelay(
			delay,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
		)
		floatY.value = withRepeat(
			withSequence(
				withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
		rotation.value = withRepeat(
			withSequence(
				withTiming(0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
				withTiming(-0.025, { duration: 4000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
	}, [foodIcon.delay])

	const animatedStyle = useAnimatedStyle(() => {
		const { x, y } = foodIcon.position
		const baseSize = size * 0.75
		return {
			opacity: opacity.value,
			transform: [
				{ translateX: baseSize * x },
				{ translateY: baseSize * y + floatY.value },
				{ scale: scale.value },
				{ rotate: `${rotation.value}rad` }
			]
		}
	})

	return (
		<Animated.View style={[styles.iconContainer, animatedStyle]}>
			<PlatformIcon
				ios={{
					name: foodIcon.ios,
					size: size * 0.25,
					weight: 'semibold'
				}}
				android={{
					name: foodIcon.android as MaterialIcon,
					size: size * 0.25,
					variant: 'outlined'
				}}
				web={{
					name: foodIcon.web,
					size: size * 0.25
				}}
				style={styles.icon}
			/>
		</Animated.View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	iconContainer: {
		position: 'absolute',
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 2
	},
	icon: {
		color: theme.colors.primary
	}
}))
