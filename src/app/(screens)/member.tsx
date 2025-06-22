import Barcode from '@kichiyaki/react-native-barcode-generator'
import * as AuthSession from 'expo-auth-session'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { useEffect } from 'react'
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useMemberStore } from '@/hooks/useMemberStore'
import LogoTextSVG from '@/components/Flow/svgs/logoText'

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'app.neuland' })

const discovery = {
	authorizationEndpoint: 'https://sso.informatik.sexy/application/o/authorize/',
	tokenEndpoint: 'https://sso.informatik.sexy/application/o/token/',
	userInfoEndpoint: 'https://sso.informatik.sexy/application/o/userinfo/'
}

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
						alert('Tokens' + result.id_token)
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
					<View style={styles.idCardContainer}>
						<LinearGradient
							colors={['#000000', '#000000']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.idCard}
						>
							<View style={styles.cardHeader}>
								<View style={styles.logoContainer}>
									<LogoTextSVG size={16} color="#00ff88" />
								</View>
								<Text style={styles.cardTitle}>NEULAND ID</Text>
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
								<View style={styles.barcodeContainer}>
									<Barcode
										value={
											(info.aud as string) ?? ''
										}
										format="CODE128"
										lineColor="#000000"
										maxWidth={Dimensions.get('window').width - 120}
										height={50}
									/>
								</View>
							</View>

							<View style={styles.cardFooter}>
								<View style={styles.footerLine} />
								<Text style={styles.footerText}>Official Neuland Member</Text>
							</View>
						</LinearGradient>

						{info.groups && info.groups.length > 0 && (
							<View style={styles.groupList}>
								<Text style={styles.groupTitle}>Member Groups</Text>
								<View style={styles.groupContainer}>
									{info.groups.map((g) => (
										<View key={g} style={styles.groupBadge}>
											<Text style={styles.groupText}>{g}</Text>
										</View>
									))}
								</View>
							</View>
						)}
					</View>
				</View>
			)}
			<Text style={styles.header}>Member Data</Text>
			{info &&
				Object.entries(info).map(([key, value]) => (
					<View key={key} style={styles.row}>
						<Text style={styles.key}>{key}</Text>
						<Text style={styles.value}>
							{Array.isArray(value) ? value.join(', ') : String(value)}
						</Text>
					</View>
				))}
			<Pressable onPress={logout} style={styles.logoutButton}>
				<Text style={styles.link}>Logout</Text>
			</Pressable>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	container: { padding: 20 },
	cardWrapper: { marginBottom: 30 },
	idCardContainer: {
		shadowColor: '#00ff88',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.4,
		shadowRadius: 15,
		elevation: 15,
		borderRadius: theme.radius.lg,
		overflow: 'visible',
		marginHorizontal: 4
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
	logoContainer: {},
	logoText: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: 'bold'
	},
	cardTitle: {
		color: '#00ff88',
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
		color: '#00ff88',
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
		color: '#00ff88',
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
		backgroundColor: '#00ff88',
		marginBottom: 12,
		opacity: 0.8
	},
	footerText: {
		color: '#00ff88',
		fontSize: 12,
		fontWeight: '500',
		opacity: 0.8,
		textAlign: 'center'
	},
	groupList: {
		padding: 24,
		
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
		backgroundColor: '#e9ecef',
		borderRadius: theme.radius.infinite,
		paddingHorizontal: 16,
		paddingVertical: 8
	},
	groupText: {
		color: '#212529',
		fontSize: 12,
		fontWeight: '600'
	},
	header: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
		color: theme.colors.text
	},
	row: { marginBottom: 10 },
	key: { fontWeight: 'bold', color: theme.colors.text },
	value: { color: theme.colors.text },
	link: { color: theme.colors.primary, fontSize: 16 },
	logoutButton: { marginTop: 20 }
}))
