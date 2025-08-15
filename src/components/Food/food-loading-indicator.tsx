import type React from 'react'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
	Easing,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { SharedPlate } from './shared-plate'
import { useSharedPlateAnimations } from './use-shared-plate-animations'

interface FoodLoadingIndicatorProps {
	/** The size of the loading indicator in pixels. Defaults to 120. */
	size?: number
}

const FOOD_ICONS = [
	{
		ios: 'carrot' as const,
		android: 'ramen_dining' as const,
		web: 'Ham' as const,
		delay: 0,
		position: { x: 0.8, y: -0.6 }
	},
	{
		ios: 'takeoutbag.and.cup.and.straw' as const,
		android: 'lunch_dining' as const,
		web: 'Pizza' as const,
		delay: 400,
		position: { x: -0.85, y: -0.45 }
	},
	{
		ios: 'cup.and.saucer' as const,
		android: 'coffee' as const,
		web: 'Coffee' as const,
		delay: 800,
		position: { x: 0.45, y: 0.9 }
	}
]

/**
 * A loading indicator that uses the exact same plate design as the plate-animation component,
 * but simplified for loading purposes with animated dots below.
 */
export const FoodLoadingIndicator = ({
	size = 120
}: FoodLoadingIndicatorProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	// Use shared animations hook
	const {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		icon0Style,
		icon1Style,
		icon2Style
	} = useSharedPlateAnimations({ size, enableTapAnimations: false })

	// Loading dots animation
	const dot1Opacity = useSharedValue(0.6)
	const dot2Opacity = useSharedValue(0.6)
	const dot3Opacity = useSharedValue(0.6)

	// Start dots animation
	useEffect(() => {
		// Animated dots
		dot1Opacity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
				withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.quad) })
			),
			-1,
			true
		)

		dot2Opacity.value = withDelay(
			200,
			withRepeat(
				withSequence(
					withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
					withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.quad) })
				),
				-1,
				true
			)
		)

		dot3Opacity.value = withDelay(
			400,
			withRepeat(
				withSequence(
					withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
					withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.quad) })
				),
				-1,
				true
			)
		)
	}, [])

	return (
		<View style={[styles.container, { width: size * 2, height: size * 1.6 }]}>
			{/* Floating icons - exactly like plate-animation.tsx */}
			<Animated.View style={[styles.iconContainer, icon0Style]}>
				<PlatformIcon
					ios={{
						name: FOOD_ICONS[0].ios,
						size: size * 0.25,
						weight: 'semibold'
					}}
					android={{
						name: FOOD_ICONS[0].android,
						size: size * 0.25,
						variant: 'outlined'
					}}
					web={{
						name: FOOD_ICONS[0].web,
						size: size * 0.25
					}}
					style={styles.icon}
				/>
			</Animated.View>

			<Animated.View style={[styles.iconContainer, icon1Style]}>
				<PlatformIcon
					ios={{
						name: FOOD_ICONS[1].ios,
						size: size * 0.25,
						weight: 'semibold'
					}}
					android={{
						name: FOOD_ICONS[1].android,
						size: size * 0.25,
						variant: 'outlined'
					}}
					web={{
						name: FOOD_ICONS[1].web,
						size: size * 0.25
					}}
					style={styles.icon}
				/>
			</Animated.View>

			<Animated.View style={[styles.iconContainer, icon2Style]}>
				<PlatformIcon
					ios={{
						name: FOOD_ICONS[2].ios,
						size: size * 0.25,
						weight: 'semibold'
					}}
					android={{
						name: FOOD_ICONS[2].android,
						size: size * 0.25,
						variant: 'outlined'
					}}
					web={{
						name: FOOD_ICONS[2].web,
						size: size * 0.25
					}}
					style={styles.icon}
				/>
			</Animated.View>

			{/* Use shared plate component */}
			<SharedPlate
				size={size}
				plateAnimatedStyle={plateAnimatedStyle}
				plateInnerAnimatedStyle={plateInnerAnimatedStyle}
				showCurvedText={true}
			/>

			{/* Loading dots below */}
			<View style={styles.loadingDotsContainer}>
				<View style={styles.loadingDots}>
					<Animated.View style={{ opacity: dot1Opacity }}>
						<View style={[styles.dot]} />
					</Animated.View>
					<Animated.View style={{ opacity: dot2Opacity }}>
						<View style={[styles.dot]} />
					</Animated.View>
					<Animated.View style={{ opacity: dot3Opacity }}>
						<View style={[styles.dot]} />
					</Animated.View>
				</View>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		paddingVertical: 0
	},
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
	},
	loadingDotsContainer: {
		position: 'absolute',
		bottom: -60,
		alignItems: 'center',
		justifyContent: 'center'
	},
	loadingDots: {
		flexDirection: 'row',
		gap: 8
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.primary
	}
}))

export default FoodLoadingIndicator
