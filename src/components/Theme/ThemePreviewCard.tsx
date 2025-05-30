import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface ThemePreviewCardProps {
	isDark: boolean
	isActive: boolean
	label: string
	onPress: () => void
}

const ThemePreviewCard = ({
	isDark,
	isActive,
	label,
	onPress
}: ThemePreviewCardProps): React.JSX.Element => {
	const { styles } = useStyles(previewCardStylesheet)
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }]
	}))

	return (
		<View style={styles.previewWrapper}>
			<Text style={styles.themeLabel}>{label}</Text>
			<Pressable
				onPressIn={() => {
					scale.value = withSpring(0.95, { damping: 15 })
				}}
				onPressOut={() => {
					scale.value = withSpring(1, { damping: 15 })
				}}
				onPress={onPress}
				style={styles.pressable}
			>
				<Animated.View
					style={[
						styles.preview,
						{ backgroundColor: isDark ? '#000000' : '#fff' },
						isActive && styles.activePreview,
						animatedStyle
					]}
				>
					<View style={styles.header}>
						<View
							style={[
								styles.headerLine,
								{ backgroundColor: isDark ? '#fff' : '#000', opacity: 0.15 }
							]}
						/>
						<View
							style={[
								styles.headerLine,
								{
									backgroundColor: isDark ? '#fff' : '#000',
									opacity: 0.15,
									width: '40%'
								}
							]}
						/>
					</View>
					<View style={styles.content}>
						<View
							style={[
								styles.card,
								{ backgroundColor: isDark ? '#151515' : '#e9e9f0' }
							]}
						>
							<View style={styles.cardContent}>
								<View style={styles.cardLines}>
									<View
										style={[
											styles.cardLine,
											{
												backgroundColor: isDark ? '#fff' : '#000',
												opacity: 0.1
											}
										]}
									/>
									<View
										style={[
											styles.cardLine,
											{
												backgroundColor: isDark ? '#fff' : '#000',
												opacity: 0.1,
												width: '70%'
											}
										]}
									/>
								</View>
							</View>
						</View>
						<View
							style={[
								styles.card,
								{ backgroundColor: isDark ? '#151515' : '#e9e9f0' }
							]}
						>
							<View style={styles.cardContent}>
								<View style={styles.cardLines}>
									<View
										style={[
											styles.cardLine,
											{
												backgroundColor: isDark ? '#fff' : '#000',
												opacity: 0.1
											}
										]}
									/>
									<View
										style={[
											styles.cardLine,
											{
												backgroundColor: isDark ? '#fff' : '#000',
												opacity: 0.1,
												width: '50%'
											}
										]}
									/>
								</View>
							</View>
						</View>
					</View>
				</Animated.View>
			</Pressable>
		</View>
	)
}

const previewCardStylesheet = createStyleSheet((theme) => ({
	previewWrapper: {
		flex: 1,
		gap: 8
	},
	pressable: {
		flex: 1
	},
	themeLabel: {
		color: theme.colors.text,
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'center'
	},
	preview: {
		flex: 1,
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: 'transparent'
	},
	activePreview: {
		borderColor: theme.colors.primary
	},
	header: {
		padding: 8,
		gap: 4
	},
	headerLine: {
		height: 4,
		borderRadius: 2
	},
	content: {
		flex: 1,
		padding: 8,
		gap: 8
	},
	card: {
		flex: 1,
		borderRadius: 8,
		overflow: 'hidden'
	},
	cardContent: {
		flex: 1,
		padding: 8,
		justifyContent: 'center'
	},
	cardLines: {
		gap: 4
	},
	cardLine: {
		height: 3,
		borderRadius: 2
	}
}))

export default ThemePreviewCard
