import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { Star } from 'lucide-react-native'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Pressable as RNPressable,
	Text,
	View
} from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming
} from 'react-native-reanimated'
import QRCode from 'react-qr-code'
import { useCSSVariable } from 'uniwind'
import MemberAPI, { type ProfileQrResponse } from '@/api/member-api'
import LogoCardSVG from '@/components/Flow/svgs/logo-card'
import LogoTextSVG from '@/components/Flow/svgs/logo-text'
import type { MemberInfo } from '@/hooks/useMemberStore'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import { AnimatedSecurityLine } from './animated-security-line'
import { QRCodeModal } from './qr-code-modal'

interface IDCardProps {
	info: MemberInfo
	idToken: string | null
}

export function IDCard({ info, idToken }: IDCardProps): React.JSX.Element {
	const neulandGreen = toColor(useCSSVariable('--color-neuland-green'))
	const labelBackgroundColor = toColor(
		useCSSVariable('--color-label-background')
	)
	const { t } = useTranslation('member')

	const [modalVisible, setModalVisible] = useState(false)

	const breathingOpacity = useSharedValue(0.3)
	const hasHonoraryRole =
		info.groups?.some((group) =>
			group.toLowerCase().includes('ehrenmitglied')
		) ?? false

	useEffect(() => {
		breathingOpacity.value = withRepeat(
			withTiming(0.6, {
				duration: 4000,
				easing: Easing.inOut(Easing.ease)
			}),
			-1,
			true
		)
	}, [breathingOpacity])

	const breathingAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: breathingOpacity.value
		}
	})

	const openModal = () => {
		setModalVisible(true)
	}

	const closeModal = () => {
		setModalVisible(false)
	}

	const {
		data: profileQrData,
		isLoading,
		error
	} = useQuery<ProfileQrResponse | undefined>({
		queryKey: ['profileQr', info.sub],
		enabled: !!idToken,
		queryFn: async () => {
			if (!idToken) {
				throw new Error('No idToken available')
			}
			return await MemberAPI.getProfileQr(idToken)
		},
		staleTime: 70 * 60 * 60 * 1000,
		gcTime: 72 * 60 * 60 * 1000
	})

	return (
		<>
			<View className="rounded-lg overflow-hidden">
				<View className="rounded-lg" style={hairlineBorder}>
					<LinearGradient
						colors={['#0f0f0f', '#001f05']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						className="rounded-lg p-6 min-h-[200px] justify-between"
					>
						<Animated.View
							style={[
								{
									position: 'absolute',
									top: -60,
									right: -135,
									zIndex: 0,
									pointerEvents: 'none'
								},
								breathingAnimatedStyle
							]}
						>
							<LogoCardSVG />
						</Animated.View>
						<View className="flex-row items-center justify-between mb-5 relative">
							<View className="items-center justify-center">
								<LogoTextSVG size={16} color="#00ff33" />
							</View>
							<View className="items-end">
								<Text className="text-[#00ff33] text-xs font-bold tracking-[1.5px] opacity-90">
									{t('idCard.title')}
								</Text>
								<AnimatedSecurityLine />
							</View>
						</View>

						<View className="flex-1 justify-center">
							<View className="mb-5">
								<Text
									className="text-xs font-semibold tracking-wide opacity-80 mb-1 uppercase"
									style={{ color: neulandGreen }}
								>
									{t('idCard.name')}
								</Text>
								<View className="flex-row items-center justify-between">
									<Text className="text-white text-[32px] font-bold tracking-[0.5px] shrink pr-3">
										{info.name}
									</Text>
									{hasHonoraryRole && (
										<View className="ml-3 self-start">
											<Animated.View
												style={[
													{
														position: 'absolute',
														top: -6,
														right: -6,
														bottom: -6,
														left: -6,
														borderRadius: 22,
														backgroundColor: '#f7d774',
														opacity: 0.35
													},
													breathingAnimatedStyle
												]}
											/>
											<LinearGradient
												colors={['#f7d774', '#c6921b', '#f0c85a']}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												className="flex-row items-center gap-2 px-3 py-2 rounded-[18px] border border-black/20"
												style={{
													elevation: 6,
													shadowColor: '#000000',
													shadowOpacity: 0.35,
													shadowRadius: 8,
													shadowOffset: { width: 0, height: 4 }
												}}
											>
												<View className="w-[18px] h-[18px] rounded-full bg-[#1b1303] items-center justify-center border border-[#f7d774]">
													<Star size={10} color="#f7d774" fill="#f7d774" />
												</View>
												<View>
													<Text className="text-[#1b1303] text-[11px] font-extrabold tracking-[1.2px] leading-[13px]">
														{t('idCard.honoraryLine1')}
													</Text>
													<Text className="text-[#1b1303] text-[11px] font-extrabold tracking-[1.2px] leading-[13px]">
														{t('idCard.honoraryLine2')}
													</Text>
												</View>
											</LinearGradient>
										</View>
									)}
								</View>
							</View>

							{info.preferred_username && (
								<View className="mb-5">
									<Text
										className="text-xs font-semibold tracking-wide opacity-80 mb-1 uppercase"
										style={{ color: neulandGreen }}
									>
										{t('idCard.username')}
									</Text>
									<Text className="text-white text-lg font-medium opacity-90">
										@{info.preferred_username}
									</Text>
								</View>
							)}

							{info.groups && info.groups.length > 0 && (
								<View className="mb-3">
									<Text
										className="text-xs font-semibold tracking-wide opacity-80 mb-1 uppercase"
										style={{ color: neulandGreen }}
									>
										{t('idCard.groups')}
									</Text>
									<View className="flex-row flex-wrap gap-1.5 justify-start items-center mt-1">
										{info.groups
											.filter(
												(group) =>
													!group.toLowerCase().startsWith('authentik') &&
													!group.toLowerCase().includes('ehrenmitglied')
											)
											.slice(0, 5)
											.map((group) => (
												<View
													key={group}
													className="bg-[#414141] rounded-sm px-2.5 py-1 mr-1.5 mb-1.5"
												>
													<Text className="text-white text-xs font-medium">
														{group.charAt(0).toUpperCase() + group.slice(1)}
													</Text>
												</View>
											))}
									</View>
								</View>
							)}

							<RNPressable
								className="self-center"
								onPress={openModal}
								disabled={!profileQrData?.qr}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<View className="bg-white p-2.5 rounded-md mt-5 items-center justify-center w-[140px] h-[140px] self-center">
									{isLoading ? (
										<ActivityIndicator
											size="small"
											color={labelBackgroundColor}
										/>
									) : error ? (
										<Text className="text-red-500 text-center">
											{String(error)}
										</Text>
									) : profileQrData?.qr ? (
										<QRCode
											value={profileQrData.qr}
											size={120}
											bgColor="#ffffff"
											fgColor="#000000"
											level="L"
										/>
									) : null}
								</View>
							</RNPressable>
						</View>

						<View className="mt-5 -mb-2.5">
							<View
								className="h-px mb-3 opacity-80"
								style={{ backgroundColor: neulandGreen }}
							/>
							<Text
								className="text-xs font-medium opacity-80 text-center"
								style={{ color: neulandGreen }}
							>
								{t('idCard.footer')}
							</Text>
						</View>
					</LinearGradient>
				</View>
			</View>
			<Text className="mt-1.5 text-xs px-1.5 text-label-secondary">
				{t('idCard.footerDescription')}
			</Text>

			<QRCodeModal
				visible={modalVisible}
				qrData={profileQrData?.qr}
				onClose={closeModal}
			/>
		</>
	)
}
