import { Image } from 'expo-image'
import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Modal, Platform, Pressable, Text, View } from 'react-native'
import WalletManager from 'react-native-wallet-manager'
import { useCSSVariable } from 'uniwind'
import MemberAPI from '@/api/member-api'
// @ts-expect-error no types
import AppleWalletDE from '@/assets/wallet/apple_wallet_de.svg'
// @ts-expect-error no types
import AppleWalletEN from '@/assets/wallet/apple_wallet_en.svg'
// @ts-expect-error no types
import GoogleWalletDE from '@/assets/wallet/google_wallet_de.svg'
// @ts-expect-error no types
import GoogleWalletEN from '@/assets/wallet/google_wallet_en.svg'
import PlatformIcon from '@/components/Universal/icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

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
	const { t } = useTranslation('member')
	const { info, idToken } = useMemberStore()
	const [isAddingToWallet, setIsAddingToWallet] = useState(false)
	const { i18n } = useTranslation()
	const primaryColor = toColor(useCSSVariable('--color-primary'))

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
			<Pressable
				className="flex-1 bg-black/70 justify-center items-center p-page"
				onPress={handleCancel}
			>
				<Animated.View
					className="bg-card rounded-lg max-w-[400px] w-full"
					style={hairlineBorder}
				>
					<Pressable onPress={() => {}} className="p-6">
						<View className="items-center mb-4">
							<PlatformIcon
								ios={{ name: 'exclamationmark.triangle.fill', size: 32 }}
								android={{ name: 'warning', size: 32 }}
								web={{ name: 'TriangleAlert', size: 32 }}
							/>
						</View>

						<Text className="text-xl font-bold text-text text-center mb-3">
							{t('securityWarning.title')}
						</Text>

						<Text className="text-base text-text text-center mb-5 leading-[22px]">
							{t('securityWarning.warningText')}
						</Text>

						<View className="mb-5">
							<View className="flex-row items-center mb-3 px-2">
								<PlatformIcon
									ios={{ name: 'shield.fill', size: 16 }}
									android={{ name: 'security', size: 16 }}
									web={{ name: 'Shield', size: 16 }}
									style={{ color: primaryColor, marginRight: 12 }}
								/>
								<Text className="flex-1 text-sm text-text leading-5">
									{t('securityWarning.points.security')}
								</Text>
							</View>

							<View className="flex-row items-center mb-3 px-2">
								<PlatformIcon
									ios={{ name: 'qrcode', size: 16 }}
									android={{ name: 'qr_code', size: 16 }}
									web={{ name: 'QrCode', size: 16 }}
									style={{ color: primaryColor, marginRight: 12 }}
								/>
								<Text className="flex-1 text-sm text-text leading-5">
									{t('securityWarning.points.qrCode')}
								</Text>
							</View>

							<View className="flex-row items-center mb-3 px-2">
								<PlatformIcon
									ios={{ name: 'calendar', size: 16 }}
									android={{ name: 'event', size: 16 }}
									web={{ name: 'Calendar', size: 16 }}
									style={{ color: primaryColor, marginRight: 12 }}
								/>
								<Text className="flex-1 text-sm text-text leading-5">
									{t('securityWarning.points.semester')}
								</Text>
							</View>
						</View>

						<View className="items-center mb-[18px]">
							<Pressable
								onPress={handleConfirm}
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
						</View>

						<View className="items-center">
							<Pressable
								onPress={handleCancel}
								className="py-3 px-6 rounded-md items-center justify-center bg-card-button active:opacity-70"
							>
								<Text className="font-semibold text-text">
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
