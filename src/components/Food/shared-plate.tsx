import type React from 'react'
import { View } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
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
	const plateOuter = toColor(useCSSVariable('--color-plate-outer'))
	const plateOuterBorder = toColor(useCSSVariable('--color-plate-outer-border'))
	const plateRim = toColor(useCSSVariable('--color-plate-rim'))
	const plateRimBorder = toColor(useCSSVariable('--color-plate-rim-border'))
	const plateInner = toColor(useCSSVariable('--color-plate-inner'))
	const plateInnerBorder = toColor(useCSSVariable('--color-plate-inner-border'))
	const plateShadow = toColor(useCSSVariable('--color-plate-shadow'))
	const plateInnerShadow = toColor(useCSSVariable('--color-plate-inner-shadow'))
	const labelColor = toColor(useCSSVariable('--color-label'))

	return (
		<Animated.View
			className="items-center justify-center absolute z-[1]"
			style={[
				{
					shadowColor: plateShadow,
					shadowOffset: { width: 0, height: 6 },
					shadowOpacity: 0.25,
					shadowRadius: 15
				},
				plateAnimatedStyle
			]}
		>
			<View
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: 999,
					backgroundColor: plateOuter,
					shadowColor: plateInnerShadow,
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.2,
					shadowRadius: 10,
					borderWidth: 0.5,
					borderColor: plateOuterBorder,
					width: size * 1.3,
					height: size * 1.3
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
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: 999,
						backgroundColor: plateRim,
						borderWidth: 0.5,
						borderColor: plateRimBorder,
						width: size * 1.17,
						height: size * 1.17
					}}
				>
					<Animated.View
						style={[
							{
								backgroundColor: plateInner,
								borderRadius: 999,
								alignItems: 'center',
								justifyContent: 'center',
								shadowColor: plateShadow,
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.15,
								shadowRadius: 5,
								overflow: 'hidden',
								borderWidth: 0.5,
								borderColor: plateInnerBorder,
								width: size * 0.8,
								height: size * 0.8
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
								style={{ color: labelColor, opacity: 0.8 }}
							/>
						</View>
					</Animated.View>
				</View>
			</View>
		</Animated.View>
	)
}

export default SharedPlate
