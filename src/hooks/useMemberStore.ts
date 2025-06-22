import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

// Simple JWT decoder using built-in React Native APIs
// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
function decodeJwt(token: string): any {
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
	[key: string]: unknown
}

interface MemberStore {
	idToken: string | null
	refreshToken: string | null
	info: MemberInfo | null
	setTokens: (idToken: string, refreshToken?: string | null) => void
	logout: () => void
}

export const useMemberStore = create<MemberStore>()(
	persist(
		(set) => ({
			idToken: null,
			refreshToken: null,
			info: null,
			setTokens: (idToken: string, refreshToken: string | null = null) => {
				const info = decodeJwt(idToken) as MemberInfo
				set({ idToken, refreshToken, info })
			},
			logout: () => set({ idToken: null, refreshToken: null, info: null })
		}),
		{
			name: 'member-store',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
