import type React from 'react'
import { Text, View } from 'react-native'

interface RelativeTimeLabelProps {
	label: string
	showNowDot?: boolean
	highlighted?: boolean
	numberOfLines?: number
}

const RelativeTimeLabel = ({
	label,
	showNowDot = false,
	highlighted = false,
	numberOfLines
}: RelativeTimeLabelProps): React.JSX.Element => (
	<View className="flex-row items-center justify-end gap-1.5">
		{showNowDot && (
			<View className="h-3.5 justify-center">
				<View className="size-2 shrink-0 translate-y-0.5 rounded-full bg-primary" />
			</View>
		)}
		<Text
			className={`text-right text-sm leading-none text-label ${highlighted ? 'font-medium text-primary' : ''}`}
			numberOfLines={numberOfLines}
		>
			{label}
		</Text>
	</View>
)

export default RelativeTimeLabel
