import * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import MemberAPI, { AUTH_DISCOVERY } from '@/api/member-api'
import ErrorView from '@/components/Error/error-view'
import { LoggedOutView } from '@/components/Member/logged-out-view'
import { useMemberStore } from '@/hooks/useMemberStore'
import { useOfficeToggleAfterLogin } from '@/hooks/useOfficeToggleAfterLogin'
import { toColor } from '@/utils/uniwind-utils'

const LoggedInView = lazy(async () => {
	const module = await import('@/components/Member/logged-in-view')
	return { default: module.LoggedInView }
})

const redirectUri = AuthSession.makeRedirectUri({
	scheme: 'neuland',
	path: 'member'
})

function MemberLoading(): React.JSX.Element {
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	return (
		<View className="flex-1 items-center justify-center bg-background">
			<ActivityIndicator color={primaryColor} />
		</View>
	)
}

export default function Member(): React.JSX.Element {
	const idToken = useMemberStore((s) => s.idToken)
	const setTokens = useMemberStore((s) => s.setTokens)
	const { t } = useTranslation('member')

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

	if (Platform.OS === 'web') {
		return (
			<ErrorView
				title={t('web.title')}
				message={t('web.message')}
				isCritical={false}
			/>
		)
	}

	if (!idToken) {
		return <LoggedOutView request={request} promptAsync={promptAsync} />
	}

	return (
		<Suspense fallback={<MemberLoading />}>
			<LoggedInView />
		</Suspense>
	)
}
