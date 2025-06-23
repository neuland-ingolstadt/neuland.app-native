import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Linking,
	Modal,
	Pressable,
	Animated as RNAnimated,
	Animated as RNAnimatedModal,
	Pressable as RNPressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import Animated, {
	interpolate,
	SensorType,
	useAnimatedSensor,
	useAnimatedStyle,
	withSpring
} from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'
import QRCode from 'react-qr-code'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import FormList from '@/components/Universal/FormList'
import PlatformIcon from '@/components/Universal/Icon'
import type { MemberInfo } from '@/hooks/useMemberStore'
import { useMemberStore } from '@/hooks/useMemberStore'
import type { FormListSections } from '@/types/components'
import { stylesheet } from './styles'

const quickLinksSections: FormListSections[] = [
	{
		items: [
			{
				title: 'Neuland Website',
				onPress: () => Linking.openURL('https://neuland-ingolstadt.de'),
				icon: {
					ios: 'globe',
					android: 'public',
					web: 'Globe'
				}
			},
			{
				title: 'Wiki',
				onPress: () => Linking.openURL('https://wiki.informatik.sexy'),
				icon: {
					ios: 'book.closed',
					android: 'menu_book',
					web: 'BookOpen'
				}
			},
			{
				title: 'SSO Profile',
				onPress: () => Linking.openURL('https://sso.informatik.sexy/'),
				icon: {
					ios: 'person.crop.circle',
					android: 'account_circle',
					web: 'User'
				}
			}
		]
	}
]

function AnimatedSecurityLine(): React.JSX.Element {
	const animatedValue = useRef(new RNAnimated.Value(0)).current

	useEffect(() => {
		const startAnimation = () => {
			RNAnimated.loop(
				RNAnimated.sequence([
					RNAnimated.timing(animatedValue, {
						toValue: 1,
						duration: 2000,
						useNativeDriver: false
					}),
					RNAnimated.timing(animatedValue, {
						toValue: 0,
						duration: 2000,
						useNativeDriver: false
					})
				])
			).start()
		}

		startAnimation()
	}, [animatedValue])

	const translateX = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [-200, 200]
	})

	return (
		<View
			style={{ height: 2, overflow: 'hidden', marginTop: 8, width: '100%' }}
		>
			<RNAnimated.View
				style={{
					height: 2,
					width: '100%',
					backgroundColor: '#00ff33',
					transform: [{ translateX }],
					opacity: 0.8
				}}
			/>
		</View>
	)
}

function fetchProfileQr(token: string) {
	return fetch('https://id.neuland.ing/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			query:
				'query ProfileQr($token: String!) { profileQr(token: $token) { qr iat exp } }',
			variables: { token }
		})
	}).then(async (res) => {
		const json = await res.json()
		if (json.data && json.data.profileQr) {
			return json.data.profileQr
		}
		throw new Error('Failed to fetch QR code')
	})
}

// Define the type for the profileQr response
interface ProfileQrResponse {
	qr: string
	iat: number
	exp: number
}

function InteractiveIDCard({
	info,
	idToken
}: {
	info: MemberInfo
	idToken: string | null
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE, {
		interval: 16 // 60fps
	})

	const [modalVisible, setModalVisible] = useState(false)
	const scaleAnim = useRef(new RNAnimatedModal.Value(0)).current

	const openModal = () => {
		setModalVisible(true)
		RNAnimatedModal.timing(scaleAnim, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true
		}).start()
	}

	const closeModal = () => {
		RNAnimatedModal.timing(scaleAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true
		}).start(() => setModalVisible(false))
	}

	const {
		data: profileQrData,
		isLoading,
		error
	} = useQuery<ProfileQrResponse | undefined>({
		queryKey: ['profileQr', idToken],
		enabled: !!idToken,
		queryFn: async () => {
			const result = await fetchProfileQr(idToken!)
			console.log('[QR] QR code fetched/refetched:', result)
			return result
		},
		staleTime: 6 * 24 * 60 * 60 * 1000 // 6 days in ms
	})

	const cardAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value
		const translateX = interpolate(x, [-1, 1], [-2, 2], 'clamp')
		const translateY = interpolate(y, [-1, 1], [-2, 2], 'clamp')
		const rotateX = interpolate(y, [-1, 1], [-0.5, 0.5], 'clamp')
		const rotateY = interpolate(x, [-1, 1], [-0.5, 0.5], 'clamp')

		return {
			transform: [
				{ translateX: withSpring(translateX, { damping: 15, stiffness: 100 }) },
				{ translateY: withSpring(translateY, { damping: 15, stiffness: 100 }) },
				{ rotateX: `${rotateX}deg` },
				{ rotateY: `${rotateY}deg` }
			]
		}
	})

	const logoAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value
		const translateX = interpolate(x, [-1, 1], [-1, 1], 'clamp')
		const translateY = interpolate(y, [-1, 1], [-1, 1], 'clamp')
		const scale = interpolate(
			Math.abs(x) + Math.abs(y),
			[0, 1],
			[1, 1.01],
			'clamp'
		)

		return {
			transform: [
				{ translateX: withSpring(translateX, { damping: 20, stiffness: 150 }) },
				{ translateY: withSpring(translateY, { damping: 20, stiffness: 150 }) },
				{ scale: withSpring(scale, { damping: 20, stiffness: 150 }) }
			]
		}
	})

	const qrCodeAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value
		const translateX = interpolate(x, [-1, 1], [-0.5, 0.5], 'clamp')
		const translateY = interpolate(y, [-1, 1], [-0.5, 0.5], 'clamp')

		return {
			transform: [
				{ translateX: withSpring(translateX, { damping: 25, stiffness: 200 }) },
				{ translateY: withSpring(translateY, { damping: 25, stiffness: 200 }) }
			]
		}
	})

	return (
		<>
			<Animated.View style={[styles.idCardContainer, cardAnimatedStyle]}>
				<Animated.View style={styles.shadow}>
					<LinearGradient
						colors={['#0f0f0f', '#001f05']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.idCard}
					>
						<View style={styles.cardHeader}>
							<Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
								<LogoTextSVG size={16} color="#00ff33" />
							</Animated.View>
							<View style={styles.titleContainer}>
								<Text style={styles.cardTitle}>NEULAND ID</Text>
								<AnimatedSecurityLine />
							</View>
						</View>

						<View style={styles.cardContent}>
							<View style={styles.nameSection}>
								<Text style={styles.nameLabel}>NAME</Text>
								<Text style={styles.name}>{info.name}</Text>
							</View>

							{info.preferred_username && (
								<View style={styles.usernameSection}>
									<Text style={styles.fieldLabel}>USERNAME</Text>
									<Text style={styles.username}>
										@{info.preferred_username}
									</Text>
								</View>
							)}

							{/* Show groups on the card instead of email */}
							{info.groups && info.groups.length > 0 && (
								<View style={{ marginBottom: 12 }}>
									<Text style={styles.fieldLabel}>GROUPS</Text>
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
										{info.groups.map((group) => (
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
													{group}
												</Text>
											</View>
										))}
									</View>
								</View>
							)}

							<RNPressable style={{ alignSelf: 'center' }} onPress={openModal}>
								<Animated.View
									style={[styles.qrCodeContainer, qrCodeAnimatedStyle]}
								>
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
								</Animated.View>
							</RNPressable>
						</View>

						{info.groups && info.groups.length > 0 && (
							<View style={styles.cardFooter}>
								<View style={styles.footerLine} />
								<Text style={styles.footerText}>Neuland Ingolstadt e.V.</Text>
							</View>
						)}
					</LinearGradient>
				</Animated.View>
			</Animated.View>

			{/* Modal for enlarged QR code */}
			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={closeModal}
			>
				<RNPressable
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.85)',
						justifyContent: 'center',
						alignItems: 'center'
					}}
					onPress={closeModal}
				>
					<RNAnimatedModal.View
						style={{
							backgroundColor: '#fff',
							borderRadius: 20,
							padding: 24,
							alignItems: 'center',
							justifyContent: 'center',
							transform: [{ scale: scaleAnim }],
							elevation: 10
						}}
					>
						{profileQrData?.qr && (
							<QRCode
								value={profileQrData.qr}
								size={280}
								bgColor="#ffffff"
								fgColor="#000000"
								level="L"
							/>
						)}
						<Text
							style={{
								marginTop: 18,
								color: '#222',
								fontWeight: '600',
								fontSize: 16,
								textAlign: 'center'
							}}
						>
							Tap anywhere to close
						</Text>
					</RNAnimatedModal.View>
				</RNPressable>
			</Modal>
		</>
	)
}

export function LoggedInView(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { info, logout, refreshTokens, idToken } = useMemberStore()

	// JWT refresh logic: only refresh on mount if expired
	useEffect(() => {
		if (!info?.exp) {
			return
		}

		const expirationTime = info.exp * 1000
		const now = Date.now()
		const remaining = expirationTime - now

		if (remaining <= 0) {
			console.log('[JWT] Token expired on mount, attempting refresh...')
			void refreshTokens()
		} else {
			console.log(
				'[JWT] Token valid on mount, expires in',
				Math.floor(remaining / 1000),
				'seconds'
			)
		}
	}, [info, refreshTokens])

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={false}
		>
			{info && (
				<View style={styles.cardWrapper}>
					<InteractiveIDCard info={info} idToken={idToken} />
				</View>
			)}
			<FormList sections={quickLinksSections} />

			<Pressable onPress={logout} style={styles.logoutButton}>
				<PlatformIcon
					ios={{
						name: 'rectangle.portrait.and.arrow.right',
						size: 18
					}}
					android={{
						name: 'logout',
						size: 22
					}}
					web={{
						name: 'LogOut',
						size: 22
					}}
					style={styles.notification}
				/>
				<Text style={styles.logoutText}>Logout</Text>
			</Pressable>
		</ScrollView>
	)
}
