import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface EventProgressBarProps {
	progress: number
}

export default function EventProgressBar({
	progress
}: EventProgressBarProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.progressBarContainer}>
			<View
				style={[
					styles.progressBar,
					{
						width: `${progress * 100}%`
					}
				]}
			/>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	progressBarContainer: {
		height: 4,
		backgroundColor: theme.colors.border,
		borderRadius: 2,
		overflow: 'hidden'
	},
	progressBar: {
		height: '100%',
		borderRadius: 2,
		backgroundColor: theme.colors.primary
	}
}))
