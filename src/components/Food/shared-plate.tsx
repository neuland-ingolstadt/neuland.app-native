import type React from 'react'
import { View } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
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
	const { styles } = useStyles(stylesheet)

	return (
		<Animated.View style={[styles.plateContainer, plateAnimatedStyle]}>
			{/* Main plate */}
			<View
				style={[styles.plateOuter, { width: size * 1.3, height: size * 1.3 }]}
			>
				{/* Engraved text */}
				{showCurvedText && (
					<CurvedText
						text="NEULAND NEXT"
						radius={size * 0.63 - 1.3}
						size={size * 0.07}
						startAngle={20}
					/>
				)}

				{/* Plate rim */}
				<View
					style={[styles.plateRim, { width: size * 1.17, height: size * 1.17 }]}
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
						<View style={styles.emptyContainer}>
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
								style={styles.emptyIcon}
							/>
						</View>
					</Animated.View>
				</View>
			</View>
		</Animated.View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	plateContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		zIndex: 1,
		shadowColor: theme.colors.plateShadow,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 15
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
	}
}))

export default SharedPlate
