import { Platform } from 'react-native'
import packageInfo from '../../package.json'

const ID_API_BASE = 'https://id.neuland-ingolstadt.de/api'
const AUTH_TOKEN_ENDPOINT = 'https://auth.neuland.ing/application/o/token/'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

export const AUTH_DISCOVERY = {
	authorizationEndpoint: 'https://auth.neuland.ing/application/o/authorize/',
	tokenEndpoint: AUTH_TOKEN_ENDPOINT,
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

	private async postTokenRequest(
		body: URLSearchParams
	): Promise<MemberTokenResponse> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

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
}

export default new MemberAPIClient()
