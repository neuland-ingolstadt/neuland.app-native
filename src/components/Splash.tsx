import { View } from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'
import Rive from 'rive-react-native'

interface AnimatedScreenProps {
	handleAnimationEnd: () => void
}

export default function Splash({ handleAnimationEnd }: AnimatedScreenProps) {
	const { styles } = useStyles(stylesheet)
	const isDark = UnistylesRuntime.themeName === 'dark'
	return (
		<View style={styles.container}>
			<Rive
				autoplay
				resourceName={
					isDark
						? 'neuland.app-native-splashscreen-dark'
						: 'neuland.app-native-splashscreen'
				}
				style={styles.animation}
				onStop={handleAnimationEnd}
				onPause={handleAnimationEnd}
				onError={(e) => console.error('Splash screen animation error:', e)}
			/>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.colors.background
	},
	animation: {
		width: '100%',
		height: '100%'
	}
}))
