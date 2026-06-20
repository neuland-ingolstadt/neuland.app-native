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
import { FloatingFoodIcon } from './floating-food-icon'
import { FOOD_ICONS } from './food-icons'
import { SharedPlate } from './shared-plate'
import { useSharedPlateAnimations } from './use-shared-plate-animations'

interface FoodLoadingIndicatorProps {
	/** The size of the loading indicator in pixels. Defaults to 120. */
	size?: number
}

/**
 * A loading indicator that uses the exact same plate design as the plate-animation component,
 * but simplified for loading purposes with animated dots below.
 */
export const FoodLoadingIndicator = ({
	size = 120
}: FoodLoadingIndicatorProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	const { plateAnimatedStyle, plateInnerAnimatedStyle } =
		useSharedPlateAnimations({
			enableTapAnimations: false,
			baseInnerColor: theme.colors.plateInner,
			tapTintColor: theme.colors.primary
		})

	const dot1Opacity = useSharedValue(0.6)
	const dot2Opacity = useSharedValue(0.6)
	const dot3Opacity = useSharedValue(0.6)

	useEffect(() => {
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
			{FOOD_ICONS.map((foodIcon) => (
				<FloatingFoodIcon key={foodIcon.ios} foodIcon={foodIcon} size={size} />
			))}

			<SharedPlate
				size={size}
				plateAnimatedStyle={plateAnimatedStyle}
				plateInnerAnimatedStyle={plateInnerAnimatedStyle}
				showCurvedText={true}
			/>

			<View style={styles.loadingDotsContainer}>
				<View style={styles.loadingDots}>
					<Animated.View style={{ opacity: dot1Opacity }}>
						<View style={styles.dot} />
					</Animated.View>
					<Animated.View style={{ opacity: dot2Opacity }}>
						<View style={styles.dot} />
					</Animated.View>
					<Animated.View style={{ opacity: dot3Opacity }}>
						<View style={styles.dot} />
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
