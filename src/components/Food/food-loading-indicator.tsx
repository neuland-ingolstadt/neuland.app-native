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
import PlatformIcon from '@/components/Universal/Icon'
import { toColor } from '@/utils/uniwind-utils'
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
	const plateInnerColor = useCSSVariable('--color-plate-inner') as string
	const primaryColor = useCSSVariable('--color-primary') as string

	const {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		icon0Style,
		icon1Style,
		icon2Style
	} = useSharedPlateAnimations({
		size,
		enableTapAnimations: false,
		baseInnerColor: plateInnerColor,
		tapTintColor: primaryColor
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
			className="items-center justify-center relative"
			style={{ width: size * 2, height: size * 1.6 }}
		>
			<Animated.View
				className="absolute w-10 h-10 items-center justify-center z-[2]"
				style={icon0Style}
			>
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
					style={{ color: toColor(primaryColor) }}
				/>
			</Animated.View>

			<Animated.View
				className="absolute w-10 h-10 items-center justify-center z-[2]"
				style={icon1Style}
			>
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
					style={{ color: toColor(primaryColor) }}
				/>
			</Animated.View>

			<Animated.View
				className="absolute w-10 h-10 items-center justify-center z-[2]"
				style={icon2Style}
			>
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
					style={{ color: toColor(primaryColor) }}
				/>
			</Animated.View>

			<SharedPlate
				size={size}
				plateAnimatedStyle={plateAnimatedStyle}
				plateInnerAnimatedStyle={plateInnerAnimatedStyle}
				showCurvedText={true}
			/>

			<View className="absolute -bottom-[60px] items-center justify-center">
				<View className="flex-row gap-2">
					<Animated.View style={{ opacity: dot1Opacity }}>
						<View className="w-2 h-2 rounded-sm bg-primary" />
					</Animated.View>
					<Animated.View style={{ opacity: dot2Opacity }}>
						<View className="w-2 h-2 rounded-sm bg-primary" />
					</Animated.View>
					<Animated.View style={{ opacity: dot3Opacity }}>
						<View className="w-2 h-2 rounded-sm bg-primary" />
					</Animated.View>
				</View>
			</View>
		</View>
	)
}

export default FoodLoadingIndicator
