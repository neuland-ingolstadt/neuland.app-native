import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const setTokensMock = mock(async () => {})
const refreshTokensMock = mock(async () => {})
const loadSecureAsyncMock = mock(async (_key: string) => null as string | null)
const getOfficePresenceMock = mock(async () => ({ registered: false }))
const checkInToOfficeMock = mock(async () => ({}))
const checkOutOfOfficeMock = mock(async () => ({}))

let memberState: {
	idToken: string | null
	info: { exp?: number } | null
	setTokens: typeof setTokensMock
	refreshTokens: typeof refreshTokensMock
} = {
	idToken: null,
	info: null,
	setTokens: setTokensMock,
	refreshTokens: refreshTokensMock
}

mock.module(`${SRC_ROOT}hooks/useMemberStore.ts`, () => ({
	useMemberStore: {
		getState: () => memberState
	}
}))

mock.module(`${SRC_ROOT}utils/storage.ts`, () => ({
	loadSecureAsync: loadSecureAsyncMock,
	saveSecureAsync: async () => {},
	deleteSecure: () => {},
	appStorage: {
		set: () => {},
		remove: () => {},
		getBoolean: () => false
	}
}))

mock.module(`${SRC_ROOT}api/office-presence-api.ts`, () => ({
	getOfficePresence: getOfficePresenceMock,
	checkInToOffice: checkInToOfficeMock,
	checkOutOfOffice: checkOutOfOfficeMock
}))

let officePresenceUtils: typeof import('../office-presence-utils')

beforeAll(async () => {
	officePresenceUtils = await import('../office-presence-utils')
})

describe('office-presence-utils', () => {
	beforeEach(() => {
		memberState = {
			idToken: null,
			info: null,
			setTokens: setTokensMock,
			refreshTokens: refreshTokensMock
		}
		setTokensMock.mockReset()
		setTokensMock.mockImplementation(async () => {})
		refreshTokensMock.mockReset()
		refreshTokensMock.mockImplementation(async () => {})
		loadSecureAsyncMock.mockReset()
		loadSecureAsyncMock.mockImplementation(async () => null)
		getOfficePresenceMock.mockReset()
		getOfficePresenceMock.mockResolvedValue({ registered: false })
		checkInToOfficeMock.mockReset()
		checkOutOfOfficeMock.mockReset()
	})

	it('ensureMemberTokensLoaded - Should no-op when an id token is already loaded', async () => {
		memberState.idToken = 'existing-token'

		await officePresenceUtils.ensureMemberTokensLoaded()

		expect(loadSecureAsyncMock).not.toHaveBeenCalled()
		expect(setTokensMock).not.toHaveBeenCalled()
	})

	it('ensureMemberTokensLoaded - Should hydrate tokens from secure storage', async () => {
		loadSecureAsyncMock.mockImplementation(async (key: string) => {
			if (key === 'member_id_token') return 'stored-id'
			if (key === 'member_refresh_token') return 'stored-refresh'
			return null
		})

		await officePresenceUtils.ensureMemberTokensLoaded()

		expect(setTokensMock).toHaveBeenCalledWith('stored-id', 'stored-refresh')
	})

	it('ensureMemberTokensLoaded - Should skip setTokens when storage has no id token', async () => {
		await officePresenceUtils.ensureMemberTokensLoaded()

		expect(setTokensMock).not.toHaveBeenCalled()
	})

	it('getValidOfficePresenceToken - Should throw without an id token', async () => {
		await expect(
			officePresenceUtils.getValidOfficePresenceToken()
		).rejects.toThrow('No idToken available')
	})

	it('getValidOfficePresenceToken - Should return a still-valid token', async () => {
		memberState.idToken = 'valid-token'
		memberState.info = { exp: Math.floor(Date.now() / 1000) + 3600 }

		await expect(
			officePresenceUtils.getValidOfficePresenceToken()
		).resolves.toBe('valid-token')
		expect(refreshTokensMock).not.toHaveBeenCalled()
	})

	it('getValidOfficePresenceToken - Should refresh an almost-expired token', async () => {
		memberState.idToken = 'old-token'
		memberState.info = { exp: Math.floor(Date.now() / 1000) + 2 }
		refreshTokensMock.mockImplementation(async () => {
			memberState.idToken = 'refreshed-token'
		})

		await expect(
			officePresenceUtils.getValidOfficePresenceToken()
		).resolves.toBe('refreshed-token')
		expect(refreshTokensMock).toHaveBeenCalled()
	})

	it('getValidOfficePresenceToken - Should throw when refresh clears the token', async () => {
		memberState.idToken = 'old-token'
		memberState.info = { exp: Math.floor(Date.now() / 1000) + 2 }
		refreshTokensMock.mockImplementation(async () => {
			memberState.idToken = null
		})

		await expect(
			officePresenceUtils.getValidOfficePresenceToken()
		).rejects.toThrow('Failed to refresh token')
	})

	it('toggleOfficePresence - Should check in when not registered', async () => {
		memberState.idToken = 'token'
		getOfficePresenceMock.mockResolvedValueOnce({ registered: false })

		await expect(officePresenceUtils.toggleOfficePresence()).resolves.toBe(
			'checkIn'
		)
		expect(checkInToOfficeMock).toHaveBeenCalledWith('token')
		expect(checkOutOfOfficeMock).not.toHaveBeenCalled()
	})

	it('toggleOfficePresence - Should check out when already registered', async () => {
		memberState.idToken = 'token'
		getOfficePresenceMock.mockResolvedValueOnce({ registered: true })

		await expect(officePresenceUtils.toggleOfficePresence()).resolves.toBe(
			'checkOut'
		)
		expect(checkOutOfOfficeMock).toHaveBeenCalledWith('token')
		expect(checkInToOfficeMock).not.toHaveBeenCalled()
	})
})
