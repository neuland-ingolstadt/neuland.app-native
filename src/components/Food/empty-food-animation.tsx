import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { PlateAnimation } from './plate-animation'

/**
 * An enhanced empty state component for the food screens that displays
 * a polished animation and guidance for the user.
 */
export const EmptyFoodAnimation = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('food')

	const handleSettingsPress = () => {
		router.navigate('/food-preferences')
	}

	return (
		<Animated.View
			style={styles.container}
			entering={FadeIn.duration(600).delay(300)}
		>
			<View style={styles.contentWrapper}>
				<View style={styles.animationContainer}>
					<PlateAnimation size={130} />
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>{t('empty.title')}</Text>
					<Text style={styles.subtitle}>{t('empty.description')}</Text>

					<View style={styles.tipsContainer}>
						<View style={styles.tipRow}>
							<PlatformIcon
								ios={{
									name: 'checkmark.circle',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'check_circle',
									size: 24
								}}
								web={{
									name: 'CircleCheck',
									size: 24
								}}
								style={styles.tipIcon}
							/>
							<Text style={styles.tipText}>{t('empty.tip1')}</Text>
						</View>

						<View style={styles.tipRow}>
							<PlatformIcon
								ios={{
									name: 'calendar',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'calendar_today',
									size: 24
								}}
								web={{
									name: 'Calendar',
									size: 24
								}}
								style={styles.tipIcon}
							/>
							<Text style={styles.tipText}>{t('empty.tip2')}</Text>
						</View>
					</View>

					<Pressable
						style={styles.settingsButton}
						onPress={handleSettingsPress}
					>
						<Text style={styles.buttonText}>{t('empty.buttonSettings')}</Text>
						<PlatformIcon
							ios={{
								name: 'arrow.right',
								size: 18,
								weight: 'semibold'
							}}
							android={{
								name: 'arrow_forward',
								size: 20
							}}
							web={{
								name: 'ArrowRight',
								size: 20
							}}
							style={styles.buttonIcon}
						/>
					</Pressable>
				</View>
			</View>
		</Animated.View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		paddingHorizontal: 20,
		paddingVertical: 10
	},
	contentWrapper: {
		width: '100%',
		maxWidth: 480,
		alignItems: 'center',
		paddingVertical: 16
	},
	animationContainer: {
		marginBottom: 40,
		alignItems: 'center'
	},
	textContainer: {
		alignItems: 'center',
		width: '100%'
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: theme.colors.text,
		marginBottom: 14,
		textAlign: 'center'
	},
	subtitle: {
		fontSize: 16,
		color: theme.colors.labelColor,
		textAlign: 'center',
		marginBottom: 36,
		lineHeight: 22,
		maxWidth: '90%'
	},
	tipsContainer: {
		width: '100%',
		alignSelf: 'center',
		marginBottom: 40,
		marginTop: 8,
		gap: 16,
		paddingHorizontal: 16
	},
	tipRow: {
		flexDirection: 'row',
		gap: 20,
		alignItems: 'center'
	},
	tipIcon: {
		color: theme.colors.primary
	},
	tipText: {
		fontSize: 15,
		color: theme.colors.labelColor,
		flex: 1
	},
	settingsButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.primary,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: theme.radius.md,
		gap: 10,
		minWidth: 220
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '600',
		color: 'white'
	},
	buttonIcon: {
		color: 'white'
	}
}))
