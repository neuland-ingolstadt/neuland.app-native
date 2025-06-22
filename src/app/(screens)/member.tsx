import * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { useEffect } from 'react'
import { LoggedInView } from '@/components/Member/LoggedInView'
import { LoggedOutView } from '@/components/Member/LoggedOutView'
import { useMemberStore } from '@/hooks/useMemberStore'

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'app.neuland' })

const discovery = {
	authorizationEndpoint: 'https://sso.informatik.sexy/application/o/authorize/',
	tokenEndpoint: 'https://sso.informatik.sexy/application/o/token/',
	userInfoEndpoint: 'https://sso.informatik.sexy/application/o/userinfo/'
}

export default function Member(): React.JSX.Element {
	const idToken = useMemberStore((s) => s.idToken)
	const info = useMemberStore((s) => s.info)
	const setTokens = useMemberStore((s) => s.setTokens)
	const logout = useMemberStore((s) => s.logout)

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: process.env.EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID ?? '',
			scopes: ['openid', 'profile', 'email', 'offline_access'],
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
							client_id:
								process.env.EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID ?? '',
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
		return <LoggedOutView request={request} promptAsync={promptAsync} />
	}

	return <LoggedInView info={info} logout={logout} />
}
