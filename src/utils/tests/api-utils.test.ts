import { beforeAll, describe, expect, it, mock } from 'bun:test'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const loadSecureAsyncMock = mock(async () => 'alex.muster')
const createGuestSessionMock = mock(async () => {})
const routerNavigateMock = mock(() => {})
const apiGetPersonalDataMock = mock(async () => ({
	persdata: {
		stg: 'EI',
		po_url: 'https://www.thi.de/studium/informatik/'
	},
	pcounter: '7'
}))

mock.module(`${SRC_ROOT}utils/storage.ts`, () => ({
	loadSecureAsync: loadSecureAsyncMock
}))

mock.module(`${SRC_ROOT}api/thi-session-handler.ts`, () => ({
	createGuestSession: createGuestSessionMock
}))

mock.module('expo-router', () => ({
	router: {
		navigate: routerNavigateMock
	}
}))

mock.module(`${SRC_ROOT}api/authenticated-api.ts`, () => ({
	default: {
		getPersonalData: apiGetPersonalDataMock
	}
}))

let apiUtils: typeof import('../api-utils')

beforeAll(async () => {
	apiUtils = await import('../api-utils')
})

describe('api-utils', () => {
	it('trimErrorMsg - Should remove the wrapped message and keep the text inside quotes', () => {
		expect(
			apiUtils.trimErrorMsg('"Service for user-group not defined" (-120)')
		).toBe('Service for user-group not defined')
	})

	it('trimErrorMsg - Should return the original string when no quoted message exists', () => {
		expect(apiUtils.trimErrorMsg('User is not logged in')).toBe(
			'User is not logged in'
		)
	})

	it('isKnownError - Should recognize the known network error strings', () => {
		expect(apiUtils.isKnownError(apiUtils.networkError)).toBe(true)
		expect(apiUtils.isKnownError(apiUtils.guestError)).toBe(true)
		expect(apiUtils.isKnownError(apiUtils.permissionError)).toBe(true)
		expect(apiUtils.isKnownError(apiUtils.notLoggedInError)).toBe(true)
	})

	it('isKnownError - Should reject unrelated errors', () => {
		expect(apiUtils.isKnownError(new Error('Something else happened'))).toBe(
			false
		)
	})

	it('getUsername - Should read the stored username from secure storage', async () => {
		await expect(apiUtils.getUsername()).resolves.toBe('alex.muster')
	})

	it('getUsername - Should return an empty string when secure storage fails', async () => {
		loadSecureAsyncMock.mockReset()
		loadSecureAsyncMock.mockImplementationOnce(async () => {
			throw new Error('storage unavailable')
		})

		await expect(apiUtils.getUsername()).resolves.toBe('')
	})

	it('getPersonalData - Should merge the counter into the personal data payload', async () => {
		const result = await apiUtils.getPersonalData()
		expect(result).toMatchObject({
			stg: 'EI',
			po_url: 'https://www.thi.de/studium/informatik/',
			pcounter: '7'
		})
	})

	it('extractSpoName - Should derive the SPO name from a realistic THI URL', () => {
		expect(
			apiUtils.extractSpoName({
				po_url: 'https://www.thi.de/studium/bachelor/informatik/'
			} as never)
		).toBe('informatik')
	})

	it('extractSpoName - Should return null when no SPO URL exists', () => {
		expect(apiUtils.extractSpoName({ po_url: null } as never)).toBeNull()
	})

	it('extractFaculty - Should map a valid study code to its faculty', () => {
		expect(apiUtils.extractFaculty({ stg: 'EI' } as never)).toBe(
			'Elektro- und Informationstechnik'
		)
	})

	it('extractFaculty - Should return null for unknown or missing study codes', () => {
		expect(apiUtils.extractFaculty({ stg: 'UNKNOWN' } as never)).toBeNull()
		expect(apiUtils.extractFaculty(undefined)).toBeNull()
	})

	it('performLogout - Should reset the session and navigate back to the tabs', async () => {
		const toggleUser = mock((_user: undefined) => {})
		const resetDashboard = mock((_userKind: string) => {})
		const queryClient = {
			clear: mock(() => {})
		}

		await apiUtils.performLogout(
			toggleUser,
			resetDashboard,
			queryClient as never
		)

		expect(toggleUser).toHaveBeenCalledWith(undefined)
		expect(resetDashboard).toHaveBeenCalledWith('guest')
		expect(createGuestSessionMock).toHaveBeenCalled()
		expect(queryClient.clear).toHaveBeenCalled()
		expect(routerNavigateMock).toHaveBeenCalledWith('/(tabs)')
	})
})
