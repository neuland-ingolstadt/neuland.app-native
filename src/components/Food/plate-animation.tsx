import type React from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useCSSVariable } from 'uniwind'
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
	const plateInner = String(useCSSVariable('--color-plate-inner') ?? '')
	const primary = String(useCSSVariable('--color-primary') ?? '')

	const {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		triggerTapAnimation,
		tapCount
	} = useSharedPlateAnimations({
		enableTapAnimations: true,
		baseInnerColor: plateInner,
		tapTintColor: primary
	})

	const tapGesture = Gesture.Tap().onBegin(() => {
		triggerTapAnimation()
	})

	return (
		<View
			className="items-center justify-center relative py-0"
			style={{ width: size * 2, height: size * 1.6 }}
		>
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
