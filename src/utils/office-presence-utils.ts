import {
	checkInToOffice,
	checkOutOfOffice,
	getOfficePresence
} from '@/api/office-presence-api'
import { useMemberStore } from '@/hooks/useMemberStore'
import { loadSecureAsync } from '@/utils/storage'

export {
	consumeOfficeTogglePending,
	isOfficeTogglePending,
	setOfficeTogglePending
} from '@/utils/office-toggle-pending'

export async function ensureMemberTokensLoaded(): Promise<void> {
	const { idToken, setTokens } = useMemberStore.getState()
	if (idToken) {
		return
	}

	const [storedIdToken, storedRefreshToken] = await Promise.all([
		loadSecureAsync('member_id_token'),
		loadSecureAsync('member_refresh_token')
	])

	if (storedIdToken) {
		await setTokens(storedIdToken, storedRefreshToken)
	}
}

export async function getValidOfficePresenceToken(): Promise<string> {
	const { idToken, info, refreshTokens } = useMemberStore.getState()
	if (!idToken) {
		throw new Error('No idToken available')
	}

	if (info?.exp) {
		const expirationTime = info.exp * 1000
		const remaining = expirationTime - Date.now()
		if (remaining <= 5000) {
			await refreshTokens()
			const updatedToken = useMemberStore.getState().idToken
			if (!updatedToken) {
				throw new Error('Failed to refresh token')
			}
			return updatedToken
		}
	}

	return idToken
}

export async function toggleOfficePresence(): Promise<'checkIn' | 'checkOut'> {
	const token = await getValidOfficePresenceToken()
	const data = await getOfficePresence(token)

	if (data.registered) {
		await checkOutOfOffice(token)
		return 'checkOut'
	}

	await checkInToOffice(token)
	return 'checkIn'
}
