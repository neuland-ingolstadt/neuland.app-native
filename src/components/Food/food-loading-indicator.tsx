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
import { useCSSVariable } from 'uniwind'
import { FloatingFoodIcon } from './floating-food-icon'
import { FOOD_ICONS } from './food-icons'
import { SharedPlate } from './shared-plate'
import { useSharedPlateAnimations } from './use-shared-plate-animations'

interface FoodLoadingIndicatorProps {
	size?: number
}

export const FoodLoadingIndicator = ({
	size = 120
}: FoodLoadingIndicatorProps): React.JSX.Element => {
	const plateInner = String(useCSSVariable('--color-plate-inner') ?? '')
	const primary = String(useCSSVariable('--color-primary') ?? '')

	const { plateAnimatedStyle, plateInnerAnimatedStyle } =
		useSharedPlateAnimations({
			enableTapAnimations: false,
			baseInnerColor: plateInner,
			tapTintColor: primary
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
		<View
			className="items-center justify-center relative py-0"
			style={{ width: size * 2, height: size * 1.6 }}
		>
			{FOOD_ICONS.map((foodIcon) => (
				<FloatingFoodIcon key={foodIcon.ios} foodIcon={foodIcon} size={size} />
			))}

			<SharedPlate
				size={size}
				plateAnimatedStyle={plateAnimatedStyle}
				plateInnerAnimatedStyle={plateInnerAnimatedStyle}
				showCurvedText={true}
			/>

			<View className="absolute -bottom-[60px] items-center justify-center">
				<View className="flex-row gap-2">
					<Animated.View style={{ opacity: dot1Opacity }}>
						<View className="w-2 h-2 rounded-full bg-primary" />
					</Animated.View>
					<Animated.View style={{ opacity: dot2Opacity }}>
						<View className="w-2 h-2 rounded-full bg-primary" />
					</Animated.View>
					<Animated.View style={{ opacity: dot3Opacity }}>
						<View className="w-2 h-2 rounded-full bg-primary" />
					</Animated.View>
				</View>
			</View>
		</View>
	)
}

export default FoodLoadingIndicator
