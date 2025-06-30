import { Image } from 'expo-image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import WalletManager from 'react-native-wallet-manager'
// @ts-expect-error no types
import AppleWalletDE from '@/assets/wallet/apple_wallet_de.svg'
// @ts-expect-error no types
import AppleWalletEN from '@/assets/wallet/apple_wallet_en.svg'
import { useMemberStore } from '@/hooks/useMemberStore'
import { SecurityWarningModal } from './SecurityWarningModal'

export function AddToWalletButton(): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)
	const { info, idToken } = useMemberStore()
	const [isAddingToWallet, setIsAddingToWallet] = useState(false)
	const [showSecurityWarning, setShowSecurityWarning] = useState(false)
	const { i18n } = useTranslation()

	// Get language with fallback
	const currentLanguage = i18n.language || 'en'

	if (Platform.OS !== 'ios') {
		return null
	}

	const handleAddToWallet = async () => {
		if (!idToken) {
			return
		}

		// Show security warning first
		setShowSecurityWarning(true)
	}

	const handleConfirmAddToWallet = async () => {
		setShowSecurityWarning(false)
		setIsAddingToWallet(true)

		try {
			const canAdd = await WalletManager.canAddPasses()
			if (!canAdd) {
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
			const pkpassUrl = `https://id.neuland-ingolstadt.de/api/pkpass?token=${encodeURIComponent(currentToken)}`
			await WalletManager.addPassFromUrl(pkpassUrl)
		} catch (error) {
			console.error('Failed to add pass to wallet:', error)
		} finally {
			setIsAddingToWallet(false)
		}
	}

	const handleCancelAddToWallet = () => {
		setShowSecurityWarning(false)
	}

	return (
		<>
			<Pressable
				onPress={handleAddToWallet}
				disabled={isAddingToWallet || !idToken}
				style={[
					styles.addToWalletButton,
					(isAddingToWallet || !idToken) && styles.addToWalletButtonDisabled
				]}
			>
				<Image
					source={currentLanguage === 'de' ? AppleWalletDE : AppleWalletEN}
					style={{
						width: 160,
						height: 52,
						opacity: isAddingToWallet || !idToken ? 0.5 : 1
					}}
					contentFit="contain"
				/>
			</Pressable>

			<SecurityWarningModal
				visible={showSecurityWarning}
				onConfirm={handleConfirmAddToWallet}
				onCancel={handleCancelAddToWallet}
			/>
		</>
	)
}

const stylesheet = createStyleSheet((_theme) => ({
	addToWalletButton: {
		alignSelf: 'center',
		marginTop: 32
	},
	addToWalletButtonDisabled: {
		opacity: 0.6
	}
}))
