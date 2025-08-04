import type React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import TimeSeparator from './time-separator'

interface TimeDisplayProps {
	startTime: string
	endTime?: string
	backgroundColor?: string
	startTimeColor?: string
	endTimeColor?: string
}

/**
 * A component that displays start and end times with a separator
 */
const TimeDisplay = ({
	startTime,
	endTime,
	backgroundColor,
	startTimeColor,
	endTimeColor
}: TimeDisplayProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<View
			style={[
				styles.timeContainer,
				backgroundColor ? { backgroundColor } : undefined
			]}
		>
			<Text
				style={[
					styles.startTime,
					startTimeColor ? { color: startTimeColor } : undefined
				]}
			>
				{startTime}
			</Text>

			{endTime && (
				<>
					<TimeSeparator />
					<Text
						style={[
							styles.endTime,
							endTimeColor ? { color: endTimeColor } : undefined
						]}
					>
						{endTime}
					</Text>
				</>
			)}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	timeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.cardButton,
		paddingHorizontal: 6,
		paddingVertical: 4,
		borderRadius: 8,
		marginLeft: 8
	},
	startTime: {
		fontSize: 12,
		fontWeight: '500',
		color: theme.colors.text,
		fontVariant: ['tabular-nums']
	},
	endTime: {
		fontSize: 12,
		color: theme.colors.labelColor,
		fontVariant: ['tabular-nums']
	}
}))

export default TimeDisplay
