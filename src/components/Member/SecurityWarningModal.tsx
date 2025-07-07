import { Image } from 'expo-image'
import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Modal, Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import WalletManager from 'react-native-wallet-manager'
// @ts-expect-error no types
import AppleWalletDE from '@/assets/wallet/apple_wallet_de.svg'
// @ts-expect-error no types
import AppleWalletEN from '@/assets/wallet/apple_wallet_en.svg'
// @ts-expect-error no types
import GoogleWalletDE from '@/assets/wallet/google_wallet_de.svg'
// @ts-expect-error no types
import GoogleWalletEN from '@/assets/wallet/google_wallet_en.svg'

import PlatformIcon from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'

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
	const { info, idToken } = useMemberStore()
	const [isAddingToWallet, setIsAddingToWallet] = useState(false)
	const { i18n } = useTranslation()

	// Get language with fallback
	const currentLanguage = i18n.language || 'en'

	const handleConfirm = async () => {
		if (!idToken) {
			onConfirm()
			return
		}

		setIsAddingToWallet(true)

		try {
			const canAdd = await WalletManager.canAddPasses()
			if (!canAdd) {
				console.error('Device does not support adding passes')
				onConfirm()
				return
			}

			let currentToken = idToken
			if (info?.exp) {
				const expirationTime = info.exp * 1000
				const now = Date.now()
				const remaining = expirationTime - now

				if (remaining <= 5000) {
					await useMemberStore.getState().refreshTokens()
					const updatedToken = useMemberStore.getState().idToken
					if (updatedToken) {
						currentToken = updatedToken
					} else {
						throw new Error('Failed to refresh token')
					}
				}
			}

			if (!currentToken) {
				throw new Error('No token available for pkpass URL')
			}
			const pkpassUrl = `https://id.neuland-ingolstadt.de/api/${Platform.OS === 'ios' ? 'pkpass' : 'gpass'}?token=${encodeURIComponent(currentToken)}`
			await WalletManager.addPassFromUrl(pkpassUrl)
		} catch (error) {
			console.error('Failed to add pass to wallet:', error)
		} finally {
			setIsAddingToWallet(false)
			onConfirm()
		}
	}

	const handleCancel = () => {
		onCancel()
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
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

						{/* Wallet Button */}
						<View style={styles.walletButtonContainer}>
							<Pressable
								onPress={handleConfirm}
								disabled={isAddingToWallet}
								style={({ pressed }) => [pressed && styles.walletButtonPressed]}
							>
								<Image
									source={
										Platform.OS === 'ios'
											? currentLanguage === 'de'
												? AppleWalletDE
												: AppleWalletEN
											: currentLanguage === 'de'
												? GoogleWalletDE
												: GoogleWalletEN
									}
									style={[
										styles.walletButton,
										isAddingToWallet && styles.walletButtonDisabled
									]}
									contentFit="contain"
								/>
							</Pressable>
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
		backgroundColor: 'rgba(0,0,0,0.70)',
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
	walletButtonContainer: {
		alignItems: 'center',
		marginBottom: 18
	},
	walletButton: {
		width: 160,
		height: 52
	},
	walletButtonDisabled: {
		opacity: 0.5
	},
	buttonContainer: {
		alignItems: 'center'
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: theme.radius.md,
		alignItems: 'center',
		justifyContent: 'center'
	},
	cancelButton: {
		backgroundColor: theme.colors.cardButton
	},
	buttonPressed: {
		opacity: 0.7
	},
	cancelButtonText: {
		fontWeight: '600',
		color: theme.colors.text
	},
	walletButtonPressed: {
		opacity: 0.7
	}
}))
