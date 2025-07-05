import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Pressable as RNPressable,
	Text,
	View
} from 'react-native'
import ScreenGuardModule from 'react-native-screenguard'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import QRCode from 'react-qr-code'
import LogoCardSVG from '@/components/Flow/svgs/logo-card'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import type { MemberInfo } from '@/hooks/useMemberStore'
import { AnimatedSecurityLine } from './AnimatedSecurityLine'
import { QRCodeModal } from './QRCodeModal'

const stylesheet = createStyleSheet((theme) => ({
	shadow: {
		borderColor: theme.colors.datePickerBackground,
		borderRadius: theme.radius.lg,
		borderWidth: 1,
		elevation: 10
	},
	cardFooterText: {
		marginTop: 6,
		fontSize: 12,
		paddingHorizontal: 6,
		color: theme.colors.labelSecondaryColor
	},
	idCardContainer: {
		borderRadius: theme.radius.lg,
		overflow: 'visible'
	},
	idCard: {
		borderRadius: theme.radius.lg,
		padding: 24,
		minHeight: 200,
		justifyContent: 'space-between',
		backgroundColor: '#000000'
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20
	},
	logoContainer: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	titleContainer: {
		alignItems: 'flex-end'
	},
	cardTitle: {
		color: '#00ff33',
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 1.5,
		opacity: 0.9
	},
	cardContent: {
		flex: 1,
		justifyContent: 'center'
	},
	nameSection: {
		marginBottom: 20
	},
	nameLabel: {
		color: theme.colors.neulandGreen,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 1,
		opacity: 0.8,
		marginBottom: 4,
		textTransform: 'uppercase'
	},
	name: {
		color: '#ffffff',
		fontSize: 32,
		fontWeight: 'bold',
		letterSpacing: 0.5
	},
	usernameSection: {
		marginBottom: 20
	},
	fieldLabel: {
		color: theme.colors.neulandGreen,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 1,
		opacity: 0.8,
		marginBottom: 4,
		textTransform: 'uppercase'
	},
	username: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '500',
		opacity: 0.9
	},
	qrCodeContainer: {
		backgroundColor: '#ffffff',
		padding: 10,
		borderRadius: theme.radius.md,
		marginTop: 20,
		alignItems: 'center',
		justifyContent: 'center',
		width: 140,
		height: 140,
		alignSelf: 'center'
	},
	cardFooter: {
		marginTop: 20
	},
	footerLine: {
		height: 1,
		backgroundColor: theme.colors.neulandGreen,
		marginBottom: 12,
		opacity: 0.8
	},
	footerText: {
		color: theme.colors.neulandGreen,
		fontSize: 12,
		fontWeight: '500',
		opacity: 0.8,
		textAlign: 'center'
	}
}))

function fetchProfileQr(token: string) {
	return fetch('https://id.neuland-ingolstadt.de/api/qr', {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	}).then(async (res) => {
		if (!res.ok) {
			throw new Error('Failed to fetch QR code')
		}
		const json = await res.json()
		if (json.qr && json.iat && json.exp) {
			return json
		}
		throw new Error('Invalid QR code response')
	})
}

// Define the type for the profileQr response
interface ProfileQrResponse {
	qr: string
	iat: number
	exp: number
}

interface IDCardProps {
	info: MemberInfo
	idToken: string | null
}

export function IDCard({ info, idToken }: IDCardProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('member')

	useFocusEffect(
		useCallback(() => {
			ScreenGuardModule.register({
				backgroundColor: '#000000',
				timeAfterResume: 1500
			})

			return () => {
				ScreenGuardModule.unregister()
			}
		}, [])
	)

	const [modalVisible, setModalVisible] = useState(false)

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
			const result = await fetchProfileQr(idToken)
			return result
		},
		staleTime: 70 * 60 * 60 * 1000, // 70 hours in ms
		gcTime: 72 * 60 * 60 * 1000 // 72 hours in ms
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
						{/* Watermark Logo */}
						<View
							style={{
								position: 'absolute',
								top: -60,
								right: -125,
								zIndex: 0,
								pointerEvents: 'none'
							}}
						>
							<LogoCardSVG />
						</View>
						<View style={styles.cardHeader}>
							<View style={[styles.logoContainer]}>
								<LogoTextSVG size={16} color="#00ff33" />
							</View>
							<View style={styles.titleContainer}>
								<Text style={styles.cardTitle}>{t('idCard.title')}</Text>
								<AnimatedSecurityLine />
							</View>
						</View>

						<View style={styles.cardContent}>
							<View style={styles.nameSection}>
								<Text style={styles.nameLabel}>{t('idCard.name')}</Text>
								<Text style={styles.name}>{info.name}</Text>
							</View>

							{info.preferred_username && (
								<View style={styles.usernameSection}>
									<Text style={styles.fieldLabel}>{t('idCard.username')}</Text>
									<Text style={styles.username}>
										@{info.preferred_username}
									</Text>
								</View>
							)}

							{/* Show groups on the card instead of email */}
							{info.groups && info.groups.length > 0 && (
								<View style={{ marginBottom: 12 }}>
									<Text style={styles.fieldLabel}>{t('idCard.groups')}</Text>
									<View
										style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											gap: 6,
											justifyContent: 'flex-start',
											alignItems: 'center',
											marginTop: 4
										}}
									>
										{info.groups.slice(0, 4).map((group) => (
											<View
												key={group}
												style={{
													backgroundColor: '#414141',
													borderRadius: 8,
													paddingHorizontal: 10,
													paddingVertical: 4,
													marginRight: 6,
													marginBottom: 6
												}}
											>
												<Text
													style={{
														color: '#ffffff',
														fontSize: 12,
														fontWeight: '500'
													}}
												>
													{group.charAt(0).toUpperCase() + group.slice(1)}
												</Text>
											</View>
										))}
									</View>
								</View>
							)}

							<RNPressable
								style={{ alignSelf: 'center' }}
								onPress={openModal}
								disabled={!profileQrData?.qr}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<View style={[styles.qrCodeContainer]}>
									{isLoading ? (
										<ActivityIndicator size="small" color="#00ff33" />
									) : error ? (
										<Text style={{ color: 'red', textAlign: 'center' }}>
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

						{info.groups && info.groups.length > 0 && (
							<View style={styles.cardFooter}>
								<View style={styles.footerLine} />
								<Text style={styles.footerText}>{t('idCard.footer')}</Text>
							</View>
						)}
					</LinearGradient>
				</View>
			</View>
			<Text style={styles.cardFooterText}>{t('idCard.footerDescription')}</Text>

			<QRCodeModal
				visible={modalVisible}
				qrData={profileQrData?.qr}
				onClose={closeModal}
			/>
		</>
	)
}
