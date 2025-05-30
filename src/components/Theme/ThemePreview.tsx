import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, useColorScheme, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface ThemePreviewProps {
	theme: string
	onThemeChange: (theme: string) => void
}

const ThemePreview = ({
	theme,
	onThemeChange
}: ThemePreviewProps): React.JSX.Element => {
	const { styles } = useStyles(previewStylesheet)
	const { t } = useTranslation('settings')

	const systemTheme = useColorScheme() ?? 'light'
	const actualTheme = theme === 'auto' ? systemTheme : theme

	const lightScale = useSharedValue(1)
	const darkScale = useSharedValue(1)

	const handlePress = (isDark: boolean) => {
		const newTheme = isDark ? 'dark' : 'light'
		if (newTheme !== actualTheme) {
			onThemeChange(newTheme)
		}
	}

	const getAnimatedStyle = (isDark: boolean) => {
		const scale = isDark ? darkScale : lightScale
		// biome-ignore lint/correctness/useHookAtTopLevel: not a problem
		return useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }]
		}))
	}

	const renderPreview = (isDark: boolean) => {
		const animatedStyle = getAnimatedStyle(isDark)
		const scale = isDark ? darkScale : lightScale

		return (
			<View style={styles.previewWrapper}>
				<Text style={styles.themeLabel}>
					{isDark ? t('theme.themes.dark') : t('theme.themes.light')}
				</Text>
				<Pressable
					onPressIn={() => {
						scale.value = withSpring(0.95, { damping: 15 })
					}}
					onPressOut={() => {
						scale.value = withSpring(1, { damping: 15 })
					}}
					onPress={() => handlePress(isDark)}
					style={styles.pressable}
				>
					<Animated.View
						style={[
							styles.preview,
							{ backgroundColor: isDark ? '#000000' : '#fff' },
							actualTheme === (isDark ? 'dark' : 'light') &&
								styles.activePreview,
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

	return (
		<View style={styles.container}>
			<View style={styles.previewContainer}>
				<View style={styles.previewsRow}>
					{renderPreview(false)}
					{renderPreview(true)}
				</View>
			</View>
		</View>
	)
}

const previewStylesheet = createStyleSheet((theme) => ({
	container: {
		width: '100%',
		maxWidth: 1100,
		alignSelf: 'center',
		marginHorizontal: theme.margins.page,
		padding: 12,
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.lg,
		shadowColor: theme.colors.text,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
		marginVertical: 16
	},
	previewContainer: {
		height: 140,
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		backgroundColor: theme.colors.cardContrast
	},
	previewsRow: {
		flex: 1,
		flexDirection: 'row',
		gap: 12,
		padding: 12
	},
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

export default ThemePreview
