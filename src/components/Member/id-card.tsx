import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { Star } from 'lucide-react-native'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Pressable as RNPressable,
	StyleSheet,
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
import { toColor } from '@/utils/uniwind-utils'
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
			<View style={styles.idCardContainer}>
				<View style={styles.shadow}>
					<LinearGradient
						colors={['#0f0f0f', '#001f05']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.idCard}
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
						<View style={styles.cardHeader}>
							<View style={styles.logoContainer}>
								<LogoTextSVG size={16} color="#00ff33" />
							</View>
							<View style={styles.titleContainer}>
								<Text style={styles.cardTitle}>{t('idCard.title')}</Text>
								<AnimatedSecurityLine />
							</View>
						</View>

						<View style={styles.cardContent}>
							<View style={styles.nameSection}>
								<Text style={[styles.nameLabel, { color: neulandGreen }]}>
									{t('idCard.name')}
								</Text>
								<View style={styles.nameRow}>
									<Text style={[styles.name, styles.nameText]}>
										{info.name}
									</Text>
									{hasHonoraryRole && (
										<View style={styles.honoraryBadgeWrapper}>
											<Animated.View
												style={[
													styles.honoraryBadgeGlow,
													breathingAnimatedStyle
												]}
											/>
											<LinearGradient
												colors={['#f7d774', '#c6921b', '#f0c85a']}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												style={styles.honoraryBadge}
											>
												<View style={styles.honoraryBadgeSeal}>
													<Star size={10} color="#f7d774" fill="#f7d774" />
												</View>
												<View>
													<Text style={styles.honoraryBadgeLine}>
														{t('idCard.honoraryLine1')}
													</Text>
													<Text style={styles.honoraryBadgeLine}>
														{t('idCard.honoraryLine2')}
													</Text>
												</View>
											</LinearGradient>
										</View>
									)}
								</View>
							</View>

							{info.preferred_username && (
								<View style={styles.usernameSection}>
									<Text style={[styles.fieldLabel, { color: neulandGreen }]}>
										{t('idCard.username')}
									</Text>
									<Text style={styles.username}>
										@{info.preferred_username}
									</Text>
								</View>
							)}

							{info.groups && info.groups.length > 0 && (
								<View style={styles.groupsSection}>
									<Text style={[styles.fieldLabel, { color: neulandGreen }]}>
										{t('idCard.groups')}
									</Text>
									<View style={styles.groupsList}>
										{info.groups
											.filter(
												(group) =>
													!group.toLowerCase().startsWith('authentik') &&
													!group.toLowerCase().includes('ehrenmitglied')
											)
											.slice(0, 5)
											.map((group) => (
												<View key={group} style={styles.groupBadge}>
													<Text style={styles.groupBadgeText}>
														{group.charAt(0).toUpperCase() + group.slice(1)}
													</Text>
												</View>
											))}
									</View>
								</View>
							)}

							<RNPressable
								style={styles.qrPressable}
								onPress={openModal}
								disabled={!profileQrData?.qr}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<View style={styles.qrCodeContainer}>
									{isLoading ? (
										<ActivityIndicator
											size="small"
											color={labelBackgroundColor}
										/>
									) : error ? (
										<Text style={styles.qrErrorText}>{String(error)}</Text>
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

						<View style={styles.cardFooter}>
							<View
								style={[styles.footerLine, { backgroundColor: neulandGreen }]}
							/>
							<Text style={[styles.footerText, { color: neulandGreen }]}>
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

const styles = StyleSheet.create({
	cardContent: {
		flex: 1,
		justifyContent: 'center'
	},
	cardFooter: {
		marginBottom: -10,
		marginTop: 20
	},
	cardHeader: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		position: 'relative'
	},
	cardTitle: {
		color: '#00ff33',
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 1.5,
		opacity: 0.9
	},
	fieldLabel: {
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 1,
		marginBottom: 4,
		opacity: 0.8,
		textTransform: 'uppercase'
	},
	footerLine: {
		height: 1,
		marginBottom: 12,
		opacity: 0.8
	},
	footerText: {
		fontSize: 12,
		fontWeight: '500',
		opacity: 0.8,
		textAlign: 'center'
	},
	groupBadge: {
		backgroundColor: '#414141',
		borderRadius: 8,
		marginBottom: 6,
		marginRight: 6,
		paddingHorizontal: 10,
		paddingVertical: 4
	},
	groupBadgeText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '500'
	},
	groupsList: {
		alignItems: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		justifyContent: 'flex-start',
		marginTop: 4
	},
	groupsSection: {
		marginBottom: 12
	},
	honoraryBadge: {
		alignItems: 'center',
		borderColor: 'rgba(0,0,0,0.2)',
		borderRadius: 18,
		borderWidth: 1,
		elevation: 6,
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 8
	},
	honoraryBadgeGlow: {
		backgroundColor: '#f7d774',
		borderRadius: 22,
		bottom: -6,
		left: -6,
		opacity: 0.35,
		position: 'absolute',
		right: -6,
		top: -6
	},
	honoraryBadgeLine: {
		color: '#1b1303',
		fontSize: 11,
		fontWeight: '800',
		letterSpacing: 1.2,
		lineHeight: 13
	},
	honoraryBadgeSeal: {
		alignItems: 'center',
		backgroundColor: '#1b1303',
		borderColor: '#f7d774',
		borderRadius: 9,
		borderWidth: 1,
		height: 18,
		justifyContent: 'center',
		width: 18
	},
	honoraryBadgeWrapper: {
		alignSelf: 'flex-start',
		marginLeft: 12
	},
	idCard: {
		backgroundColor: '#000000',
		borderRadius: 22,
		justifyContent: 'space-between',
		minHeight: 200,
		padding: 24
	},
	idCardContainer: {
		borderRadius: 22,
		overflow: 'hidden'
	},
	logoContainer: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	name: {
		color: '#ffffff',
		fontSize: 32,
		fontWeight: 'bold',
		letterSpacing: 0.5
	},
	nameLabel: {
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 1,
		marginBottom: 4,
		opacity: 0.8,
		textTransform: 'uppercase'
	},
	nameRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	nameSection: {
		marginBottom: 20
	},
	nameText: {
		flexShrink: 1,
		paddingRight: 12
	},
	qrCodeContainer: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: '#ffffff',
		borderRadius: 17,
		height: 140,
		justifyContent: 'center',
		marginTop: 20,
		padding: 10,
		width: 140
	},
	qrErrorText: {
		color: 'red',
		textAlign: 'center'
	},
	qrPressable: {
		alignSelf: 'center'
	},
	shadow: {
		borderColor: '#ebebec',
		borderRadius: 22,
		borderWidth: 1,
		elevation: 10
	},
	titleContainer: {
		alignItems: 'flex-end'
	},
	username: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '500',
		opacity: 0.9
	},
	usernameSection: {
		marginBottom: 20
	}
})
