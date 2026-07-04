import type React from 'react'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Animated,
	Modal,
	Pressable,
	Text,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

const WalletPassButton = lazy(async () => {
	const module = await import('./wallet-pass-button')
	return { default: module.WalletPassButton }
})

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
	const primaryColor = toColor(useCSSVariable('--color-primary'))

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

						<View className="items-center mb-[18px] min-h-[52px] justify-center">
							{visible ? (
								<Suspense fallback={<ActivityIndicator color={primaryColor} />}>
									<WalletPassButton onComplete={onConfirm} />
								</Suspense>
							) : null}
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
