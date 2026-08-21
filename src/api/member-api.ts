import { Platform } from 'react-native'
import { appHomepage, appVersion } from '@/data/app-version'

const ID_API_BASE = 'https://id.neuland-ingolstadt.de/api'
const AUTH_TOKEN_ENDPOINT = 'https://auth.neuland.ing/application/o/token/'
const AUTH_REVOKE_ENDPOINT = 'https://auth.neuland.ing/application/o/revoke/'
const USER_AGENT = `neuland.app-native/${appVersion} (+${appHomepage})`

export const AUTH_DISCOVERY = {
	authorizationEndpoint: 'https://auth.neuland.ing/application/o/authorize/',
	tokenEndpoint: AUTH_TOKEN_ENDPOINT,
	revocationEndpoint: AUTH_REVOKE_ENDPOINT,
	userInfoEndpoint: 'https://auth.neuland.ing/application/o/userinfo/'
} as const

export interface ProfileQrResponse {
	qr: string
	iat: number
	exp: number
}

export interface MemberTokenResponse {
	id_token?: string
	refresh_token?: string
	error?: string
	error_description?: string
}

class MemberAPIClient {
	private getClientId(): string {
		return process.env.EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID ?? ''
	}

	private getFormHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}
		return headers
	}

	private async postTokenRequest(
		body: URLSearchParams
	): Promise<MemberTokenResponse> {
		const headers = this.getFormHeaders()

		const response = await fetch(AUTH_TOKEN_ENDPOINT, {
			method: 'POST',
			headers,
			body: body.toString()
		})

		const result = (await response.json()) as MemberTokenResponse

		if (!response.ok) {
			const message =
				result.error_description ??
				result.error ??
				`Token request failed (${response.status})`
			throw new Error(message)
		}

		return result
	}

	async getProfileQr(idToken: string): Promise<ProfileQrResponse> {
		const headers: Record<string, string> = {
			Authorization: `Bearer ${idToken}`,
			'Content-Type': 'application/json'
		}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const response = await fetch(`${ID_API_BASE}/qr`, { headers })

		if (!response.ok) {
			throw new Error('Failed to fetch QR code')
		}

		const json = (await response.json()) as Partial<ProfileQrResponse>
		if (
			typeof json.qr === 'string' &&
			json.qr !== '' &&
			typeof json.iat === 'number' &&
			typeof json.exp === 'number'
		) {
			return { qr: json.qr, iat: json.iat, exp: json.exp }
		}

		throw new Error('Invalid QR code response')
	}

	getAppleWalletPassUrl(idToken: string): string {
		return `${ID_API_BASE}/pkpass?token=${encodeURIComponent(idToken)}`
	}

	async getGoogleWalletPassJwt(idToken: string): Promise<string> {
		const headers: Record<string, string> = {}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const response = await fetch(
			`${ID_API_BASE}/gpass?token=${encodeURIComponent(idToken)}`,
			{ headers }
		)

		if (!response.ok) {
			throw new Error('Failed to fetch jwt')
		}

		return await response.text()
	}

	async exchangeAuthorizationCode(params: {
		code: string
		codeVerifier: string
		redirectUri: string
	}): Promise<MemberTokenResponse> {
		return await this.postTokenRequest(
			new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: this.getClientId(),
				code: params.code,
				redirect_uri: params.redirectUri,
				code_verifier: params.codeVerifier
			})
		)
	}

	async refreshAccessToken(refreshToken: string): Promise<MemberTokenResponse> {
		return await this.postTokenRequest(
			new URLSearchParams({
				grant_type: 'refresh_token',
				client_id: this.getClientId(),
				refresh_token: refreshToken
			})
		)
	}

	async revokeToken(
		token: string,
		tokenTypeHint?: 'refresh_token' | 'access_token'
	): Promise<void> {
		const body = new URLSearchParams({
			token,
			client_id: this.getClientId()
		})
		if (tokenTypeHint) {
			body.set('token_type_hint', tokenTypeHint)
		}

		const response = await fetch(AUTH_REVOKE_ENDPOINT, {
			method: 'POST',
			headers: this.getFormHeaders(),
			body: body.toString()
		})

		if (!response.ok) {
			throw new Error(`Token revocation failed (${response.status})`)
		}
	}

	async revokeSession(params: {
		refreshToken?: string | null
		idToken?: string | null
	}): Promise<void> {
		const requests: Promise<void>[] = []

		if (params.refreshToken) {
			requests.push(this.revokeToken(params.refreshToken, 'refresh_token'))
		}
		if (params.idToken) {
			requests.push(this.revokeToken(params.idToken, 'access_token'))
		}

		if (requests.length === 0) {
			return
		}

		const results = await Promise.allSettled(requests)
		const failures = results.filter(
			(result): result is PromiseRejectedResult => result.status === 'rejected'
		)
		if (failures.length === results.length) {
			throw failures[0].reason
		}
	}
}

export default new MemberAPIClient()
