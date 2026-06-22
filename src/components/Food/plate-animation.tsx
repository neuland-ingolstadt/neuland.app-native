/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO */
import type React from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/Icon'
import { toColor } from '@/utils/uniwind-utils'
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
	const plateInnerColor = useCSSVariable('--color-plate-inner') as string
	const primaryColor = useCSSVariable('--color-primary') as string

	const {
		plateAnimatedStyle,
		plateInnerAnimatedStyle,
		icon0Style,
		icon1Style,
		icon2Style,
		triggerTapAnimation
	} = useSharedPlateAnimations({
		size,
		enableTapAnimations: true,
		baseInnerColor: plateInnerColor,
		tapTintColor: primaryColor
	})

	const tapGesture = Gesture.Tap().onBegin(() => {
		triggerTapAnimation()
	})

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
