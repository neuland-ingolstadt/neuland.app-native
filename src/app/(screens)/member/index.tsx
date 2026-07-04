import * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { useEffect } from 'react'
import MemberAPI, { AUTH_DISCOVERY } from '@/api/member-api'
import { LoggedInView } from '@/components/Member/logged-in-view'
import { LoggedOutView } from '@/components/Member/logged-out-view'
import { useMemberStore } from '@/hooks/useMemberStore'
import { useOfficeToggleAfterLogin } from '@/hooks/useOfficeToggleAfterLogin'

const redirectUri = AuthSession.makeRedirectUri({
	scheme: 'neuland',
	path: 'member'
})

export default function Member(): React.JSX.Element {
	const idToken = useMemberStore((s) => s.idToken)
	const setTokens = useMemberStore((s) => s.setTokens)

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: process.env.EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID ?? '',
			scopes: ['openid', 'profile', 'email', 'offline_access'],
			redirectUri,
			responseType: AuthSession.ResponseType.Code,
			usePKCE: true
		},
		AUTH_DISCOVERY
	)

	useOfficeToggleAfterLogin()

	useEffect(() => {
		async function handleResponse() {
			if (request && response?.type === 'success' && response.params.code) {
				try {
					const result = await MemberAPI.exchangeAuthorizationCode({
						code: response.params.code,
						codeVerifier: request.codeVerifier ?? '',
						redirectUri
					})

					if (result.id_token) {
						await setTokens(result.id_token, result.refresh_token)
					}
				} catch (e) {
					console.error('Token exchange error:', e)
				}
			}
		}

		void handleResponse()
	}, [request, response, setTokens])

	if (!idToken) {
		return <LoggedOutView request={request} promptAsync={promptAsync} />
	}

	return <LoggedInView />
}
