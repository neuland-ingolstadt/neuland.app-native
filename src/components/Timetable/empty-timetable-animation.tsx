import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { TimetableAnimation } from './timetable-animation'

/**
 * An enhanced empty state component for the timetable screens that displays
 * a polished animation and guidance for the user.
 */
export const EmptyTimetableAnimation = ({
	isEmpty = false,
	onRefresh
}: {
	isEmpty?: boolean
	onRefresh?: () => void
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('timetable')

	const handleConfigurePress = () => {
		void Linking.openURL('https://hiplan.thi.de/')
	}

	const handleRefreshPress = () => {
		onRefresh?.()
	}

	return (
		<Animated.View
			style={styles.container}
			entering={FadeIn.duration(600).delay(300)}
		>
			<View style={styles.contentWrapper}>
				<View style={styles.animationContainer}>
					<TimetableAnimation size={130} />
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>
						{isEmpty ? t('error.empty.title2') : t('error.empty.title')}
					</Text>

					<View style={styles.tipsContainer}>
						<View style={styles.tipRow}>
							<PlatformIcon
								ios={{
									name: 'calendar.badge.plus',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'event_available',
									size: 24
								}}
								web={{
									name: 'CalendarPlus',
									size: 24
								}}
								style={styles.tipIcon}
							/>
							<Text style={styles.tipText}>{t('error.empty.tip1')}</Text>
						</View>

						<View style={styles.tipRow}>
							<PlatformIcon
								ios={{
									name: 'person.crop.circle.badge.checkmark',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'verified_user',
									size: 24
								}}
								web={{
									name: 'UserCheck',
									size: 24
								}}
								style={styles.tipIcon}
							/>
							<Text style={styles.tipText}>{t('error.empty.tip2')}</Text>
						</View>

						<View style={styles.tipRow}>
							<PlatformIcon
								ios={{
									name: 'arrow.clockwise',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'refresh',
									size: 24
								}}
								web={{
									name: 'RefreshCw',
									size: 24
								}}
								style={styles.tipIcon}
							/>
							<Text style={styles.tipText}>{t('error.empty.tip3')}</Text>
						</View>
					</View>

					<View style={styles.buttonContainer}>
						<Pressable
							style={styles.primaryButton}
							onPress={handleConfigurePress}
						>
							<Text style={styles.primaryButtonText}>
								{t('error.empty.button')}
							</Text>
							<PlatformIcon
								ios={{
									name: 'arrow.up.right',
									size: 18,
									weight: 'semibold'
								}}
								android={{
									name: 'open_in_new',
									size: 20
								}}
								web={{
									name: 'ExternalLink',
									size: 20
								}}
								style={styles.buttonIcon}
							/>
						</Pressable>

						<Pressable
							style={styles.secondaryButton}
							onPress={handleRefreshPress}
						>
							<Text style={styles.secondaryButtonText}>
								{t('error.empty.refresh')}
							</Text>
						</Pressable>
					</View>
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
		marginBottom: 36,
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
	buttonContainer: {
		width: '100%',
		gap: 12,
		alignItems: 'center'
	},
	primaryButton: {
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
	primaryButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: 'white'
	},
	buttonIcon: {
		color: 'white'
	},
	secondaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.card,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: theme.radius.md,
		gap: 8,
		minWidth: 180
	},
	secondaryButtonText: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.text
	}
}))
