import type React from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { FloatingFoodIcon } from './floating-food-icon'
import { FOOD_ICONS } from './food-icons'
import { SharedPlate } from './shared-plate'
import { useSharedPlateAnimations } from './use-shared-plate-animations'

interface PlateAnimationProps {
	size?: number
}

export const PlateAnimation = ({
	size = 120
}: PlateAnimationProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	const {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		triggerTapAnimation,
		tapCount
	} = useSharedPlateAnimations({
		enableTapAnimations: true,
		baseInnerColor: theme.colors.plateInner,
		tapTintColor: theme.colors.primary
	})

	const tapGesture = Gesture.Tap().onBegin(() => {
		triggerTapAnimation()
	})

	return (
		<View style={[styles.container, { width: size * 2, height: size * 1.6 }]}>
			{FOOD_ICONS.map((foodIcon) => (
				<FloatingFoodIcon
					key={foodIcon.ios}
					foodIcon={foodIcon}
					size={size}
					tapCount={tapCount}
				/>
			))}

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

const stylesheet = createStyleSheet(() => ({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		paddingVertical: 0
	}
}))
