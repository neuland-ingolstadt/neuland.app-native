import type React from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

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
	const labelColor = useCSSVariable('--color-label')

	return (
		<View
			className="mx-1"
			style={{
				backgroundColor: color || toColor(labelColor),
				width: size,
				height: size,
				borderRadius: size / 2
			}}
		/>
	)
}

export default TimeSeparator
