import { Image } from 'expo-image'
import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import WalletManager from 'react-native-wallet-manager'
import MemberAPI from '@/api/member-api'
// @ts-expect-error no types
import AppleWalletDE from '@/assets/wallet/apple_wallet_de.svg'
// @ts-expect-error no types
import AppleWalletEN from '@/assets/wallet/apple_wallet_en.svg'
// @ts-expect-error no types
import GoogleWalletDE from '@/assets/wallet/google_wallet_de.svg'
// @ts-expect-error no types
import GoogleWalletEN from '@/assets/wallet/google_wallet_en.svg'
import { useMemberStore } from '@/hooks/useMemberStore'

interface WalletPassButtonProps {
	onComplete: () => void
}

export function WalletPassButton({
	onComplete
}: WalletPassButtonProps): React.JSX.Element {
	const { info, idToken } = useMemberStore()
	const [isAddingToWallet, setIsAddingToWallet] = useState(false)
	const { i18n } = useTranslation()
	const currentLanguage = i18n.language || 'en'

	const handleConfirm = async () => {
		if (!idToken) {
			onComplete()
			return
		}

		setIsAddingToWallet(true)

		try {
			const canAdd = await WalletManager.canAddPasses()
			if (!canAdd) {
				console.error('Device does not support adding passes')
				onComplete()
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
			if (Platform.OS === 'android') {
				const jwtData = await MemberAPI.getGoogleWalletPassJwt(currentToken)
				await WalletManager.addPassToGoogleWallet(jwtData)
			} else {
				await WalletManager.addPassFromUrl(
					MemberAPI.getAppleWalletPassUrl(currentToken)
				)
			}
		} catch (error) {
			console.error('Failed to add pass to wallet:', error)
		} finally {
			setIsAddingToWallet(false)
			onComplete()
		}
	}

	return (
		<Pressable
			onPress={() => {
				void handleConfirm()
			}}
			disabled={isAddingToWallet}
			className="active:opacity-70"
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
				style={{
					width: 160,
					height: 52,
					opacity: isAddingToWallet ? 0.5 : 1
				}}
				contentFit="contain"
			/>
		</Pressable>
	)
}
