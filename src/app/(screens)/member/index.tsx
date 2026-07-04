import * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import MemberAPI, { AUTH_DISCOVERY } from '@/api/member-api'
import { LoggedInView } from '@/components/Member/logged-in-view'
import { LoggedOutView } from '@/components/Member/logged-out-view'
import { useMemberStore } from '@/hooks/useMemberStore'
import { useOfficeToggleAfterLogin } from '@/hooks/useOfficeToggleAfterLogin'

const MEMBER_AUTH_STATE_KEY = 'member-auth-state'
const MEMBER_PKCE_VERIFIER_KEY = 'member-pkce-verifier'

function getMemberRedirectUri(): string {
	return AuthSession.makeRedirectUri({
		scheme: 'neuland',
		path: 'member'
	})
}

function clearMemberAuthSession(): void {
	if (Platform.OS !== 'web' || typeof window === 'undefined') {
		return
	}

	sessionStorage.removeItem(MEMBER_AUTH_STATE_KEY)
	sessionStorage.removeItem(MEMBER_PKCE_VERIFIER_KEY)
}

function storeMemberAuthSession(request: AuthSession.AuthRequest): void {
	if (Platform.OS !== 'web' || typeof window === 'undefined') {
		return
	}

	sessionStorage.setItem(MEMBER_AUTH_STATE_KEY, request.state)
	if (request.codeVerifier) {
		sessionStorage.setItem(MEMBER_PKCE_VERIFIER_KEY, request.codeVerifier)
	}
}

export default function Member(): React.JSX.Element {
	const idToken = useMemberStore((s) => s.idToken)
	const setTokens = useMemberStore((s) => s.setTokens)
	const redirectUri = useMemo(() => getMemberRedirectUri(), [])

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

	const exchangeAuthorizationCode = useCallback(
		async (code: string, codeVerifier: string): Promise<void> => {
			const result = await MemberAPI.exchangeAuthorizationCode({
				code,
				codeVerifier,
				redirectUri
			})

			if (result.id_token) {
				await setTokens(result.id_token, result.refresh_token)
			}
		},
		[redirectUri, setTokens]
	)

	useEffect(() => {
		async function handleResponse() {
			if (request && response?.type === 'success' && response.params.code) {
				try {
					await exchangeAuthorizationCode(
						response.params.code,
						request.codeVerifier ?? ''
					)
				} catch (e) {
					console.error('Token exchange error:', e)
				} finally {
					clearMemberAuthSession()
				}
			}
		}

		void handleResponse()
	}, [exchangeAuthorizationCode, request, response])

	useEffect(() => {
		if (Platform.OS !== 'web' || idToken || typeof window === 'undefined') {
			return
		}

		const params = new URLSearchParams(window.location.search)
		const code = params.get('code')
		const state = params.get('state')

		if (!code || !state || window.opener) {
			return
		}

		const storedState = sessionStorage.getItem(MEMBER_AUTH_STATE_KEY)
		const codeVerifier = sessionStorage.getItem(MEMBER_PKCE_VERIFIER_KEY)

		if (!storedState || !codeVerifier || storedState !== state) {
			return
		}

		void (async () => {
			try {
				await exchangeAuthorizationCode(code, codeVerifier)
			} catch (e) {
				console.error('Token exchange error:', e)
			} finally {
				clearMemberAuthSession()
				window.history.replaceState({}, '', `${window.location.origin}/member`)
			}
		})()
	}, [exchangeAuthorizationCode, idToken])

	const handlePromptAsync = async (): Promise<void> => {
		if (!request) {
			return
		}

		if (Platform.OS === 'web') {
			storeMemberAuthSession(request)
			const authUrl = await request.makeAuthUrlAsync(AUTH_DISCOVERY)
			window.location.assign(authUrl)
			return
		}

		await promptAsync()
	}

	if (!idToken) {
		return (
			<LoggedOutView
				request={request}
				promptAsync={() => void handlePromptAsync()}
			/>
		)
	}

	return <LoggedInView />
}
