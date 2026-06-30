import type React from 'react'
import { View } from 'react-native'

interface ColorBandProps {
	color: string
	width?: number
}

/**
 * A vertical colored band used on the left side of event cards
 */
const ColorBand = ({ color, width = 6 }: ColorBandProps): React.JSX.Element => {
	return (
		<View
			className="rounded-tl-md rounded-bl-md"
			style={{
				backgroundColor: color,
				width
			}}
		/>
	)
}

export default ColorBand
