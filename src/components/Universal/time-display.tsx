import type React from 'react'
import { Text, View } from 'react-native'
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
	return (
		<View
			className="flex-row items-center bg-card-button px-1.5 py-1 rounded-sm ml-2"
			style={backgroundColor ? { backgroundColor } : undefined}
		>
			<Text
				className="text-xs font-medium text-text tabular-nums"
				style={startTimeColor ? { color: startTimeColor } : undefined}
			>
				{startTime}
			</Text>

			{endTime && (
				<>
					<TimeSeparator />
					<Text
						className="text-xs text-label tabular-nums"
						style={endTimeColor ? { color: endTimeColor } : undefined}
					>
						{endTime}
					</Text>
				</>
			)}
		</View>
	)
}

export default TimeDisplay
