import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

// Simple JWT decoder using built-in React Native APIs
// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
export function decodeJwt(token: string): any {
	try {
		const base64Url = token.split('.')[1]
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
				.join('')
		)
		return JSON.parse(jsonPayload)
	} catch (error) {
		console.error('Failed to decode JWT:', error)
		return {}
	}
}

export interface MemberInfo {
	email?: string
	email_verified?: boolean
	name?: string
	given_name?: string
	preferred_username?: string
	nickname?: string
	entryUUID?: string
	groups?: string[]
	exp?: number
	[key: string]: unknown
}

interface MemberStore {
	idToken: string | null
	refreshToken: string | null
	info: MemberInfo | null
	setTokens: (idToken: string, refreshToken?: string | null) => void
	logout: () => void
	refreshTokens: () => Promise<void>
}

export const useMemberStore = create<MemberStore>()(
	persist(
		(set, get) => ({
			idToken: null,
			refreshToken: null,
			info: null,
			setTokens: (idToken: string, refreshToken: string | null = null) => {
				const info = decodeJwt(idToken) as MemberInfo
				console.log('New JWT token set:', { idToken, refreshToken, info })
				set({ idToken, refreshToken, info })
			},
			logout: () => set({ idToken: null, refreshToken: null, info: null }),
			refreshTokens: async () => {
				const { refreshToken, setTokens, logout } = get()
				if (!refreshToken) {
					logout()
					return
				}

				try {
					const response = await fetch(
						'https://sso.informatik.sexy/application/o/token/',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							body: new URLSearchParams({
								grant_type: 'refresh_token',
								client_id:
									process.env.EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID ?? '',
								refresh_token: refreshToken
							}).toString()
						}
					)

					const result = await response.json()

					if (response.ok && result.id_token) {
						console.log('Successfully refreshed token')
						setTokens(result.id_token, result.refresh_token ?? refreshToken)
					} else {
						console.error('Failed to refresh token, logging out.', result)
						logout()
					}
				} catch (e) {
					console.error('An error occurred while refreshing token:', e)
					logout()
				}
			}
		}),
		{
			name: 'member-store',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
