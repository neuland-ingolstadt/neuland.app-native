import { View } from 'react-native'

interface EventProgressBarProps {
	progress: number
}

export default function EventProgressBar({
	progress
}: EventProgressBarProps): React.JSX.Element {
	return (
		<View className="h-1 bg-border rounded-sm overflow-hidden">
			<View
				className="h-full rounded-sm bg-primary"
				style={{
					width: `${progress * 100}%`
				}}
			/>
		</View>
	)
}
