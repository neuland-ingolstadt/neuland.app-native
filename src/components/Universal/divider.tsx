import type React from 'react'
import {
	type ColorValue,
	type DimensionValue,
	type FlexAlignType,
	Platform,
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
 * Drawn as a 1pt filled row instead of `border-b-hairline`. Hairline strokes
 * (~1 device pixel via `StyleSheet.hairlineWidth`) round away at fractional Y
 * offsets in a scrolling iOS form sheet, which made FormList separators
 * flicker while the event-details sheet moved.
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
				className="h-[1px]"
				style={{
					width: width ?? '100%',
					backgroundColor: color ?? toColor(defaultColor)
				}}
			/>
		</View>
	)
}

export default Divider
