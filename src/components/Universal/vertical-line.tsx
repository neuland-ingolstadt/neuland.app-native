import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface VerticalLineProps {
	color?: string
	opacity?: number
}

const VerticalLine = ({
	color,
	opacity = 0.4
}: VerticalLineProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	return (
		<View
			style={[
				styles.verticalLine,
				{
					backgroundColor: color ?? theme.colors.primary,
					opacity
				}
			]}
		/>
	)
}

const stylesheet = createStyleSheet(() => ({
	verticalLine: {
		width: 2,
		maxWidth: 2, // needed for web
		borderRadius: 2,
		marginRight: 10,
		marginTop: 1,
		alignSelf: 'stretch',
		flexGrow: 1,
		flexShrink: 0
	}
}))

export default VerticalLine
