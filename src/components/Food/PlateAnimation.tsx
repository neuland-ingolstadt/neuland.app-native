import PlatformIcon from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'
import type React from 'react'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
	withDelay,
	withSequence
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface PlateAnimationProps {
	size?: number
}

// Custom positions for icons to avoid circular pattern
const FOOD_ICONS = [
	{
		ios: 'carrot',
		android: 'restaurant',
		web: 'Soup',
		delay: 0,
		position: { x: 0.8, y: -0.6 }
	},
	{
		ios: 'takeoutbag.and.cup.and.straw',
		android: 'restaurant_menu',
		web: 'Pizza',
		delay: 400,
		position: { x: -0.85, y: -0.45 }
	},
	{
		ios: 'cup.and.saucer',
		android: 'coffee',
		web: 'Coffee',
		delay: 800,
		position: { x: 0.45, y: 0.9 }
	}
	// Removed fourth and fifth icons
]

// Component for creating curved text along the plate rim
const CurvedText = ({
	text,
	radius,
	size,
	startAngle = 90
}: {
	text: string
	radius: number
	size: number
	startAngle?: number
}) => {
	const characters = text.split('')
	const anglePerChar = 5 // Angle between characters in degrees
	const startAngleRad = (startAngle * Math.PI) / 180
	const { theme } = useStyles()
	return (
		<View
			style={{ width: radius * 2, height: radius * 2, position: 'absolute' }}
		>
			{characters.map((char, index) => {
				// Fixed angle calculation to display text in correct order
				const angle =
					startAngleRad -
					((characters.length - 1) / 2 - index) *
						((anglePerChar * Math.PI) / 180)

				return (
					<View
						key={index}
						style={{
							position: 'absolute',
							left: radius + radius * Math.cos(angle) - size / 2 + 1,
							top: radius + radius * Math.sin(angle) - size / 2,
							width: size,
							height: size,
							transform: [{ rotate: `${angle + Math.PI / 2}rad` }],
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							style={{
								fontSize: size * 0.7,
								color: theme.colors.text,
								fontWeight: '300',
								opacity: 0.7
							}}
						>
							{char}
						</Text>
					</View>
				)
			})}
		</View>
	)
}

export const PlateAnimation = ({
	size = 120
}: PlateAnimationProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	// Plate animation values
	const plateScale = useSharedValue(0.9)
	const plateLift = useSharedValue(0)
	const plateOpacity = useSharedValue(0)
	const plateGlowIntensity = useSharedValue(0)

	// Empty plate icon animation values
	const emptyIconOpacity = useSharedValue(0)
	const emptyIconScale = useSharedValue(0.8)

	// Icon animation values
	const iconsArray = FOOD_ICONS.map(() => ({
		opacity: useSharedValue(0),
		scale: useSharedValue(0.6),
		floatY: useSharedValue(0),
		rotation: useSharedValue(Math.random() * 0.05 - 0.025) // Reduced random initial rotation
	}))

	// Start animations on component mount
	useEffect(() => {
		// Animate plate appearing
		plateOpacity.value = withTiming(1, {
			duration: 800,
			easing: Easing.out(Easing.quad)
		})

		// Continuous subtle plate animation
		plateScale.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
				withTiming(0.97, { duration: 2200, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		plateLift.value = withRepeat(
			withSequence(
				withTiming(3, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
				withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		// Plate subtle glow animation
		plateGlowIntensity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
				withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.cubic) })
			),
			-1,
			true
		)

		// Empty icon appearing
		emptyIconOpacity.value = withDelay(
			300,
			withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) })
		)

		emptyIconScale.value = withDelay(
			300,
			withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) })
		)

		// Animate icons with natural floating movement
		iconsArray.forEach((icon, index) => {
			const delay = FOOD_ICONS[index].delay

			// Fade in with delay
			icon.opacity.value = withDelay(
				delay,
				withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
			)

			// Scale up with delay
			icon.scale.value = withDelay(
				delay,
				withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) })
			)

			// Natural floating movement
			icon.floatY.value = withDelay(
				delay,
				withRepeat(
					withSequence(
						withTiming(4, {
							duration: 3000 + Math.random() * 1000, // Slower animation speed
							easing: Easing.inOut(Easing.sin)
						}),
						withTiming(-4, {
							duration: 3000 + Math.random() * 1000, // Slower animation speed
							easing: Easing.inOut(Easing.sin)
						})
					),
					-1,
					true
				)
			)

			// Subtle rotation
			icon.rotation.value = withDelay(
				delay,
				withRepeat(
					withSequence(
						withTiming(0.025, {
							duration: 4000 + Math.random() * 1000, // Slower rotation speed
							easing: Easing.inOut(Easing.sin)
						}),
						withTiming(-0.025, {
							duration: 4000 + Math.random() * 1000, // Slower rotation speed
							easing: Easing.inOut(Easing.sin)
						})
					),
					-1,
					true
				)
			)
		})
	}, [])

	// Animated styles for plate
	const plateAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: plateScale.value }, { translateY: plateLift.value }],
			opacity: plateOpacity.value,
			shadowOpacity: 0.2 + plateGlowIntensity.value * 0.15
		}
	})

	const plateInnerAnimatedStyle = useAnimatedStyle(() => {
		return {
			shadowOpacity: 0.1 + plateGlowIntensity.value * 0.1
		}
	})

	// Empty icon animated style
	const emptyIconAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: emptyIconOpacity.value,
			transform: [{ scale: emptyIconScale.value }]
		}
	})

	// Generate animated styles for each icon based on their custom positions
	const iconAnimatedStyles = iconsArray.map((icon, index) => {
		return useAnimatedStyle(() => {
			const { x, y } = FOOD_ICONS[index].position
			const baseSize = size * 0.75 // Base radius for positioning

			return {
				opacity: icon.opacity.value,
				transform: [
					{ translateX: baseSize * x },
					{ translateY: baseSize * y + icon.floatY.value },
					{ scale: icon.scale.value },
					{ rotate: `${icon.rotation.value}rad` }
				]
			}
		})
	})

	return (
		<View style={[styles.container, { width: size * 2, height: size * 1.6 }]}>
			{/* Floating icons */}
			{FOOD_ICONS.map((foodIcon, index) => (
				<Animated.View
					key={`icon-${index}`}
					style={[styles.iconContainer, iconAnimatedStyles[index]]}
				>
					<PlatformIcon
						ios={{
							name: foodIcon.ios,
							size: size * 0.25,
							weight: 'semibold'
						}}
						android={{
							name: foodIcon.android as MaterialIcon,
							size: size * 0.25
						}}
						web={{
							// biome-ignore lint/suspicious/noExplicitAny:
							name: foodIcon.web as any,
							size: size * 0.25
						}}
						style={styles.icon}
					/>
				</Animated.View>
			))}

			{/* Plate */}
			<Animated.View style={[styles.plateContainer, plateAnimatedStyle]}>
				{/* Main plate */}
				<View
					style={[styles.plateOuter, { width: size * 1.3, height: size * 1.3 }]}
				>
					{/* Engraved text */}
					<CurvedText
						text="NEULAND"
						radius={size * 0.63 - 3}
						size={size * 0.07}
						startAngle={25}
					/>

					{/* Plate rim */}
					<View
						style={[
							styles.plateRim,
							{ width: size * 1.17, height: size * 1.17 }
						]}
					>
						{/* Plate inner circle */}
						<Animated.View
							style={[
								styles.plateInner,
								{ width: size * 0.8, height: size * 0.8 },
								plateInnerAnimatedStyle
							]}
						>
							{/* Empty plate icon */}
							<Animated.View
								style={[styles.emptyContainer, emptyIconAnimatedStyle]}
							>
								<PlatformIcon
									ios={{
										name: 'fork.knife',
										size: size * 0.35,
										weight: 'light',
										renderMode: 'monochrome'
									}}
									android={{
										name: 'restaurant_menu',
										size: size * 0.35
									}}
									web={{
										name: 'Utensils',
										size: size * 0.35
									}}
									style={styles.emptyIcon}
								/>
							</Animated.View>
						</Animated.View>
					</View>
				</View>
			</Animated.View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		paddingVertical: 0 // Ensuring no extra padding
	},
	plateContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		zIndex: 1,
		shadowColor: theme.colors.plateShadow,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 15,
		elevation: 10
	},
	plateOuter: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 999,
		backgroundColor: theme.colors.plateOuter,
		shadowColor: theme.colors.plateInnerShadow,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 8,
		borderWidth: 0.5,
		borderColor: theme.colors.plateOuterBorder
	},
	plateRim: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 999,
		backgroundColor: theme.colors.plateRim,
		borderWidth: 0.5,
		borderColor: theme.colors.plateRimBorder
	},
	plateInner: {
		backgroundColor: theme.colors.plateInner,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: theme.colors.plateShadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 5,
		elevation: 4,
		overflow: 'hidden',
		borderWidth: 0.5,
		borderColor: theme.colors.plateInnerBorder
	},

	emptyContainer: {
		width: '60%',
		height: '60%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	emptyIcon: {
		color: theme.colors.labelColor,
		opacity: 0.8
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
