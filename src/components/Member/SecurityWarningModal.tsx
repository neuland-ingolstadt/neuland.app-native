import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Modal, Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'

interface SecurityWarningModalProps {
	visible: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function SecurityWarningModal({
	visible,
	onConfirm,
	onCancel
}: SecurityWarningModalProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('member')

	const handleConfirm = () => {
		if (Platform.OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		}
		onConfirm()
	}

	const handleCancel = () => {
		if (Platform.OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		}
		onCancel()
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={handleCancel}
		>
			<Pressable style={styles.overlay} onPress={handleCancel}>
				<Animated.View style={[styles.modalContainer]}>
					<Pressable onPress={() => {}} style={styles.content}>
						{/* Warning Icon */}
						<View style={styles.iconContainer}>
							<PlatformIcon
								ios={{ name: 'exclamationmark.triangle.fill', size: 32 }}
								android={{ name: 'warning', size: 32 }}
								web={{ name: 'TriangleAlert', size: 32 }}
							/>
						</View>

						{/* Title */}
						<Text style={styles.title}>{t('securityWarning.title')}</Text>

						{/* Warning Text */}
						<Text style={styles.warningText}>
							{t('securityWarning.warningText')}
						</Text>

						{/* Warning Points */}
						<View style={styles.pointsContainer}>
							<View style={styles.point}>
								<PlatformIcon
									ios={{ name: 'shield.fill', size: 16 }}
									android={{ name: 'security', size: 16 }}
									web={{ name: 'Shield', size: 16 }}
									style={styles.pointIcon}
								/>
								<Text style={styles.pointText}>
									{t('securityWarning.points.security')}
								</Text>
							</View>

							<View style={styles.point}>
								<PlatformIcon
									ios={{ name: 'qrcode', size: 16 }}
									android={{ name: 'qr_code', size: 16 }}
									web={{ name: 'QrCode', size: 16 }}
									style={styles.pointIcon}
								/>
								<Text style={styles.pointText}>
									{t('securityWarning.points.qrCode')}
								</Text>
							</View>

							<View style={styles.point}>
								<PlatformIcon
									ios={{ name: 'calendar', size: 16 }}
									android={{ name: 'event', size: 16 }}
									web={{ name: 'Calendar', size: 16 }}
									style={styles.pointIcon}
								/>
								<Text style={styles.pointText}>
									{t('securityWarning.points.semester')}
								</Text>
							</View>
						</View>

						{/* Buttons */}
						<View style={styles.buttonContainer}>
							<Pressable
								onPress={handleCancel}
								style={({ pressed }) => [
									styles.button,
									styles.cancelButton,
									pressed && styles.buttonPressed
								]}
							>
								<Text style={styles.cancelButtonText}>
									{t('securityWarning.buttons.useAppInstead')}
								</Text>
							</Pressable>

							<Pressable
								onPress={handleConfirm}
								style={({ pressed }) => [
									styles.button,
									styles.confirmButton,
									pressed && styles.buttonPressed
								]}
							>
								<Text style={styles.confirmButtonText}>
									{t('securityWarning.buttons.addToWallet')}
								</Text>
							</Pressable>
						</View>
					</Pressable>
				</Animated.View>
			</Pressable>
		</Modal>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.75)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: theme.margins.page
	},
	modalContainer: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.lg,
		maxWidth: 400,
		width: '100%',
		elevation: 10,
		borderColor: theme.colors.border,
		borderWidth: 1
	},
	content: {
		padding: 24
	},
	iconContainer: {
		alignItems: 'center',
		marginBottom: 16
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		color: theme.colors.text,
		textAlign: 'center',
		marginBottom: 12
	},
	warningText: {
		fontSize: 16,
		color: theme.colors.text,
		textAlign: 'center',
		marginBottom: 20,
		lineHeight: 22
	},
	pointsContainer: {
		marginBottom: 20
	},
	point: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		paddingHorizontal: 8
	},
	pointIcon: {
		color: theme.colors.primary,
		marginRight: 12
	},
	pointText: {
		flex: 1,
		fontSize: 14,
		color: theme.colors.text,
		lineHeight: 20
	},
	recommendationContainer: {
		backgroundColor: theme.colors.primaryBackground,
		borderRadius: theme.radius.md,
		padding: 16,
		marginBottom: 24,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary
	},
	recommendationText: {
		fontSize: 14,
		color: theme.colors.text,
		fontWeight: '600',
		lineHeight: 20
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 12
	},
	button: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: theme.radius.md,
		alignItems: 'center',
		justifyContent: 'center'
	},
	cancelButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: theme.colors.border
	},
	confirmButton: {
		backgroundColor: theme.colors.primary
	},
	buttonPressed: {
		opacity: 0.7
	},
	cancelButtonText: {
		fontWeight: '600',
		color: theme.colors.text
	},
	confirmButtonText: {
		fontWeight: '600',
		color: theme.colors.contrast
	}
}))
