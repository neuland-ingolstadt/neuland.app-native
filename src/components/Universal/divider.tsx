import type React from 'react'
import {
	type ColorValue,
	type DimensionValue,
	type FlexAlignType,
	Platform,
	StyleSheet,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface DividerProps {
	width?: DimensionValue
	color?: ColorValue
	position?: FlexAlignType
	paddingLeft?: number
}

/**
 * A dynamic component that renders a horizontal line with customizable width and color.
 *
 * @param {DimensionValue} [width='95%'] - The width of the line. Defaults to '95%'.
 * @param {string} [color='grey'] - The color of the line. Defaults to 'grey'.
 * @returns {React.JSX.Element} - A View component that renders a horizontal line.
 */
const Divider = ({
	width,
	color,
	position,
	paddingLeft
}: DividerProps): React.JSX.Element => {
	const defaultColor = useCSSVariable('--color-label-tertiary')
	// Prefer height + backgroundColor over borderBottomWidth: hairline border
	// strokes vanish at subpixel Y on iOS; fills do not (RN #58054).

	return (
		<View
			className="w-full"
			style={{
				alignSelf:
					position ?? (Platform.OS === 'android' ? 'center' : 'flex-end'),
				paddingLeft: paddingLeft ?? 0
			}}
		>
			<View
				style={{
					width: width ?? '100%',
					height: StyleSheet.hairlineWidth,
					backgroundColor: color ?? toColor(defaultColor)
				}}
			/>
		</View>
	)
}

export default Divider
