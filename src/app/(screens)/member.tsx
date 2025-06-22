import Barcode from '@kichiyaki/react-native-barcode-generator'
import * as AuthSession from 'expo-auth-session'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { useEffect, useRef } from 'react'
import {
	Dimensions,
	Linking,
	Pressable,
	Animated as RNAnimated,
	ScrollView,
	StyleSheet,
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
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import FormList from '@/components/Universal/FormList'
import PlatformIcon from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import type { FormListSections } from '@/types/components'

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'app.neuland' })

// Animated line component to prevent screenshots
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

// Interactive ID Card component with sensor-based animations
// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
function InteractiveIDCard({ info }: { info: any }): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	// Use gyroscope sensor for smooth 3D-like movement
	const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE, {
		interval: 16 // 60fps
	})

	// Animated styles for the card container
	const cardAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value

		// Interpolate sensor values to create smooth movement
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

	// Animated styles for the logo with enhanced movement
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

	// Animated styles for the barcode with subtle movement
	const barcodeAnimatedStyle = useAnimatedStyle(() => {
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

	const handleGroupPress = (_groupName: string) => {
		Haptics.selectionAsync()
	}

	return (
		<>
			<Animated.View style={[styles.idCardContainer, cardAnimatedStyle]}>
				<View style={styles.shadow}>
					<LinearGradient
						colors={['#0f0f0f', '#002906']}
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

							{info.email && (
								<View style={styles.emailSection}>
									<Text style={styles.fieldLabel}>EMAIL</Text>
									<Text style={styles.email}>{info.email}</Text>
								</View>
							)}
							<Animated.View
								style={[styles.barcodeContainer, barcodeAnimatedStyle]}
							>
								<Barcode
									value={(info.aud as string).slice(0, 20) ?? ''}
									format="CODE128"
									lineColor="#000000"
									maxWidth={Dimensions.get('window').width - 120}
									height={50}
								/>
							</Animated.View>
						</View>

						<View style={styles.cardFooter}>
							<View style={styles.footerLine} />
							<Text style={styles.footerText}>Official Neuland Member</Text>
						</View>
					</LinearGradient>
				</View>
			</Animated.View>

			{info.groups && info.groups.length > 0 && (
				<View style={styles.groupList}>
					<Text style={styles.groupTitle}>Member Groups</Text>
					<View style={styles.groupContainer}>
						{info.groups.map((g: string) => (
							<Pressable
								key={g}
								style={({ pressed }) => [
									styles.groupBadge,
									pressed && styles.groupBadgePressed
								]}
								onPress={() => handleGroupPress(g)}
							>
								<Text style={styles.groupText}>{g}</Text>
							</Pressable>
						))}
					</View>
				</View>
			)}
		</>
	)
}

const discovery = {
	authorizationEndpoint: 'https://sso.informatik.sexy/application/o/authorize/',
	tokenEndpoint: 'https://sso.informatik.sexy/application/o/token/',
	userInfoEndpoint: 'https://sso.informatik.sexy/application/o/userinfo/'
}

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

export default function Member(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const idToken = useMemberStore((s) => s.idToken)

	const info = useMemberStore((s) => s.info)
	const setTokens = useMemberStore((s) => s.setTokens)
	const logout = useMemberStore((s) => s.logout)

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: 'JUfmRZR0ndFQqB39wfj8DWYw401xZFqPRYu5hhYi',
			scopes: ['openid', 'profile', 'email'],
			redirectUri,
			responseType: AuthSession.ResponseType.Code,
			usePKCE: true
		},
		discovery
	)

	useEffect(() => {
		async function handleResponse() {
			if (request && response?.type === 'success' && response.params.code) {
				try {
					const tokenResponse = await fetch(discovery.tokenEndpoint, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							grant_type: 'authorization_code',
							client_id: 'JUfmRZR0ndFQqB39wfj8DWYw401xZFqPRYu5hhYi',
							code: response.params.code,
							redirect_uri: redirectUri,
							code_verifier: request.codeVerifier ?? ''
						}).toString()
					})

					const result = await tokenResponse.json()

					if (result.id_token) {
						setTokens(
							result.id_token as string,
							result.refresh_token as string | undefined
						)
					} else {
						console.log('Token exchange error: missing id_token')
					}
				} catch (e) {
					console.log('Token exchange error:', e)
				}
			}
		}

		void handleResponse()
	}, [request, response])

	if (!idToken) {
		return (
			<View style={styles.center}>
				<Pressable disabled={!request} onPress={() => promptAsync()}>
					<Text style={styles.link}>Sign in with Neuland</Text>
				</Pressable>
			</View>
		)
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{info && (
				<View style={styles.cardWrapper}>
					<InteractiveIDCard info={info} />
				</View>
			)}
			<FormList sections={quickLinksSections} />
			{/* <Text style={styles.header}>Member Data</Text> */}
			{/* {info &&
				Object.entries(info).map(([key, value]) => (
					<View key={key} style={styles.row}>
						<Text style={styles.key}>{key}</Text>
						<Text style={styles.value}>
							{Array.isArray(value) ? value.join(', ') : String(value)}
						</Text>
					</View>
				))}
			 */}
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

const stylesheet = createStyleSheet((theme) => ({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	container: { paddingHorizontal: theme.margins.page, paddingVertical: 30 },
	cardWrapper: { marginBottom: 30 },
	shadow: {
		shadowColor: '#00ff33',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 15,
		elevation: 15
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
	logoText: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: 'bold'
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
	emailSection: {
		marginBottom: 12
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
	email: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '500',
		opacity: 0.9
	},
	barcodeContainer: {
		backgroundColor: '#ffffff',
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderRadius: theme.radius.md,
		marginTop: 20,
		alignItems: 'center'
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
		color: '#e6e6e6',
		fontSize: 12,
		fontWeight: '500',
		opacity: 0.8,
		textAlign: 'center'
	},
	groupList: {
		padding: 24
	},
	groupTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: theme.colors.text,
		marginBottom: 16,
		textAlign: 'center'
	},
	groupContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		justifyContent: 'center'
	},
	groupBadge: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.infinite,
		paddingHorizontal: 16,
		paddingVertical: 8
	},
	groupBadgePressed: {
		backgroundColor: theme.colors.labelBackground,
		opacity: 0.8
	},
	groupText: {
		color: theme.colors.text,
		fontSize: 12,
		fontWeight: '600'
	},
	header: {
		fontSize: 22,
		fontWeight: 'bold',
		marginVertical: 20,
		color: theme.colors.text
	},
	row: { marginBottom: 10 },
	key: { fontWeight: 'bold', color: theme.colors.text },
	value: { color: theme.colors.text },
	link: { color: theme.colors.primary, fontSize: 16 },
	logoutButton: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
		marginVertical: 30,
		minWidth: 165,
		paddingHorizontal: 40,
		paddingVertical: 12
	},
	logoutText: {
		color: theme.colors.notification,
		fontSize: 16
	},
	notification: {
		color: theme.colors.notification
	}
}))
