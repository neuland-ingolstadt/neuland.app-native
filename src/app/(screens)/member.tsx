import * as AuthSession from 'expo-auth-session'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { useEffect } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useMemberStore } from '@/hooks/useMemberStore'

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'neuland' })

const discovery = {
	authorizationEndpoint: 'https://sso.informatik.sexy/application/o/authorize/',
	tokenEndpoint: 'https://sso.informatik.sexy/application/o/token/',
	userInfoEndpoint: 'https://sso.informatik.sexy/application/o/userinfo/'
}

export default function Member(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
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
					<LinearGradient
						colors={[theme.colors.primary, theme.colors.secondary]}
						style={styles.idCard}
					>
						<Text style={styles.name}>{info.name}</Text>
						{info.preferred_username && (
							<Text style={styles.username}>{info.preferred_username}</Text>
						)}
						{info.email && <Text style={styles.email}>{info.email}</Text>}
					</LinearGradient>
					{info.groups && info.groups.length > 0 && (
						<View style={styles.groupList}>
							{info.groups.map((g) => (
								<Text key={g} style={styles.group}>
									{g}
								</Text>
							))}
						</View>
					)}
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
	cardWrapper: { marginBottom: 20 },
	idCard: {
		borderRadius: theme.radius.lg,
		padding: 20
	},
	name: {
		color: theme.colors.contrast,
		fontSize: 20,
		fontWeight: 'bold'
	},
	username: { color: theme.colors.contrast, fontSize: 16 },
	email: { color: theme.colors.contrast, marginTop: 4, fontSize: 14 },
	groupList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 10
	},
	group: {
		backgroundColor: theme.colors.primaryBackground,
		borderRadius: theme.radius.sm,
		paddingHorizontal: 8,
		paddingVertical: 4,
		color: theme.colors.text,
		fontSize: 12
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
