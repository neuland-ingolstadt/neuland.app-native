import type React from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface ColorBandProps {
	color: string
	width?: number
}

/**
 * A vertical colored band used on the left side of event cards
 */
const ColorBand = ({ color, width = 6 }: ColorBandProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<View
			style={[
				styles.eventColorBand,
				{
					backgroundColor: color,
					width
				}
			]}
		/>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	eventColorBand: {
		borderTopLeftRadius: theme.radius.md,
		borderBottomLeftRadius: theme.radius.md
	}
}))

export default ColorBand
