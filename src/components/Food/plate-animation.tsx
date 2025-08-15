/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO */
import type React from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { SharedPlate } from './shared-plate'
import { useSharedPlateAnimations } from './use-shared-plate-animations'

interface PlateAnimationProps {
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
] as const

export const PlateAnimation = ({
	size = 120
}: PlateAnimationProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	// Use shared animations hook with tap animations enabled
	const {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		icon0Style,
		icon1Style,
		icon2Style,
		triggerTapAnimation
	} = useSharedPlateAnimations({ size, enableTapAnimations: true })

	// Create a tap gesture using the modern Gesture API
	const tapGesture = Gesture.Tap().onBegin(() => {
		triggerTapAnimation()
	})

	return (
		<View style={[styles.container, { width: size * 2, height: size * 1.6 }]}>
			{/* Floating icons */}
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

			{/* Plate with modern gesture detector */}
			<GestureDetector gesture={tapGesture}>
				<SharedPlate
					size={size}
					plateAnimatedStyle={plateAnimatedStyle}
					plateInnerAnimatedStyle={plateInnerAnimatedStyle}
					showCurvedText={true}
				/>
			</GestureDetector>
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
	}
}))
