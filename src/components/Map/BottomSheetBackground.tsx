import { BlurView } from 'expo-blur'
import type React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

const BottomSheetBackground = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const dark = UnistylesRuntime.themeName === 'dark'
	const darkIos = 'rgba(0, 0, 0, 0.45)'
	const lightIos = 'rgba(200, 200, 200, 0.3)'
	return Platform.OS === 'ios' ? (
		<View
			style={[
				styles.bottomSheet,
				{
					backgroundColor: dark ? darkIos : lightIos
				}
			]}
		>
			<BlurView
				intensity={85}
				style={StyleSheet.absoluteFillObject}
				tint={dark ? 'dark' : 'light'}
			/>
		</View>
	) : (
		<View style={styles.bottomSheet} />
	)
}

const stylesheet = createStyleSheet((theme) => ({
	bottomSheet: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: theme.colors.background,
		borderTopLeftRadius: theme.radius.lg,
		borderTopRightRadius: theme.radius.lg,
		overflow: 'hidden'
	}
}))

export default BottomSheetBackground
