import type React from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface VerticalLineProps {
	color?: string
	opacity?: number
}

const VerticalLine = ({
	color,
	opacity = 0.4
}: VerticalLineProps): React.JSX.Element => {
	const primaryColor = useCSSVariable('--color-primary')

	return (
		<View
			className="w-0.5 max-w-0.5 rounded-xs mr-2.5 mt-px self-stretch grow shrink-0"
			style={{
				backgroundColor: color ?? toColor(primaryColor),
				opacity
			}}
		/>
	)
}

export default VerticalLine
