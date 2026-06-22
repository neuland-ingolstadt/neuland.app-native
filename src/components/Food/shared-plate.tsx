import type React from 'react'
import { View } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/Icon'
import { toColor } from '@/utils/uniwind-utils'
import CurvedText from './curved-text'

interface SharedPlateProps {
	size: number
	plateAnimatedStyle: AnimatedStyle<Record<string, unknown>>
	plateInnerAnimatedStyle: AnimatedStyle<Record<string, unknown>>
	showCurvedText?: boolean
}

/**
 * A shared plate component that can be used by both the loading indicator
 * and the plate animation components to avoid code duplication.
 */
export const SharedPlate = ({
	size,
	plateAnimatedStyle,
	plateInnerAnimatedStyle,
	showCurvedText = true
}: SharedPlateProps): React.JSX.Element => {
	const plateShadow = useCSSVariable('--color-plate-shadow')
	const plateInnerShadow = useCSSVariable('--color-plate-inner-shadow')
	const plateOuterBorder = useCSSVariable('--color-plate-outer-border')
	const plateRimBorder = useCSSVariable('--color-plate-rim-border')
	const plateInnerBorder = useCSSVariable('--color-plate-inner-border')
	const labelColor = useCSSVariable('--color-label')

	return (
		<Animated.View
			className="items-center justify-center absolute z-[1]"
			style={[
				{
					shadowColor: toColor(plateShadow),
					shadowOffset: { width: 0, height: 6 },
					shadowOpacity: 0.25,
					shadowRadius: 15
				},
				plateAnimatedStyle
			]}
		>
			<View
				className="items-center justify-center rounded-infinite bg-plate-outer"
				style={{
					width: size * 1.3,
					height: size * 1.3,
					shadowColor: toColor(plateInnerShadow),
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.2,
					shadowRadius: 10,
					borderWidth: 0.5,
					borderColor: toColor(plateOuterBorder)
				}}
			>
				{showCurvedText && (
					<CurvedText
						text="NEULAND NEXT"
						radius={size * 0.63 - 1.3}
						size={size * 0.07}
						startAngle={20}
					/>
				)}

				<View
					className="items-center justify-center rounded-infinite bg-plate-rim"
					style={{
						width: size * 1.17,
						height: size * 1.17,
						borderWidth: 0.5,
						borderColor: toColor(plateRimBorder)
					}}
				>
					<Animated.View
						className="bg-plate-inner rounded-infinite items-center justify-center overflow-hidden"
						style={[
							{
								width: size * 0.8,
								height: size * 0.8,
								shadowColor: toColor(plateShadow),
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.15,
								shadowRadius: 5,
								borderWidth: 0.5,
								borderColor: toColor(plateInnerBorder)
							},
							plateInnerAnimatedStyle
						]}
					>
						<View className="w-[60%] h-[60%] items-center justify-center">
							<PlatformIcon
								ios={{
									name: 'fork.knife',
									size: size * 0.35,
									weight: 'light',
									renderMode: 'monochrome'
								}}
								android={{
									name: 'restaurant',
									size: size * 0.35
								}}
								web={{
									name: 'Utensils',
									size: size * 0.35
								}}
								style={{
									color: toColor(labelColor),
									opacity: 0.8
								}}
							/>
						</View>
					</Animated.View>
				</View>
			</View>
		</Animated.View>
	)
}

export default SharedPlate
