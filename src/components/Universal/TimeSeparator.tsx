import type React from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface TimeSeparatorProps {
	color?: string
	size?: number
}

/**
 * A small dot separator used between start and end times in the timetable
 */
const TimeSeparator = ({
	color,
	size = 3
}: TimeSeparatorProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	return (
		<View
			style={[
				styles.timeSeparator,
				{
					backgroundColor: color || theme.colors.labelColor,
					width: size,
					height: size,
					borderRadius: size / 2
				}
			]}
		/>
	)
}

const stylesheet = createStyleSheet(() => ({
	timeSeparator: {
		marginHorizontal: 4
	}
}))

export default TimeSeparator
