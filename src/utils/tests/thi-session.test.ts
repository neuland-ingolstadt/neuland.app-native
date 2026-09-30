import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { mockReactNative } from './react-native-mock'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

mockReactNative()

class APIError extends Error {
	public status: number
	public data: unknown

	constructor(status: number, data: unknown) {
		super(`${JSON.stringify(data)} (${status.toString()})`)
		this.status = status
		this.data = data
	}
}

const secureStore = new Map<string, string>()
const mmkvStore = new Map<string, string>()

const loginMock = mock(
	async (
		_username: string,
		_password: string
	): Promise<{ session: string; isStudent: boolean }> => ({
		session: 'new-session',
		isStudent: true
	})
)

const logoutMock = mock(async (_session: string) => true)

const loadSecureAsyncMock = mock(async (key: string) => {
	return secureStore.get(key) ?? null
})

const saveSecureAsyncMock = mock(async (key: string, value: string) => {
	secureStore.set(key, value)
})

const deleteSecureMock = mock(async (key: string) => {
	secureStore.delete(key)
})

const storageMock = {
	loadSecureAsync: loadSecureAsyncMock,
	saveSecureAsync: saveSecureAsyncMock,
	deleteSecure: deleteSecureMock,
	storage: {
		getString: (key: string) => mmkvStore.get(key),
		set: (key: string, value: string) => {
			mmkvStore.set(key, value)
		},
		clearAll: () => {
			mmkvStore.clear()
		}
	}
}

mock.module(`${SRC_ROOT}utils/storage.ts`, () => storageMock)
mock.module('@/utils/storage', () => storageMock)

const thiApiMock = {
	APIError,
	default: {
		login: loginMock,
		logout: logoutMock
	}
}

mock.module(`${SRC_ROOT}api/thi-api.ts`, () => thiApiMock)
mock.module('@/api/thi-api', () => thiApiMock)

let sessionHandler: typeof import('../../api/thi-session')

beforeAll(async () => {
	sessionHandler = await import('../../api/thi-session')
})

describe('thi-session', () => {
	beforeEach(() => {
		secureStore.clear()
		mmkvStore.clear()
		loginMock.mockReset()
		loginMock.mockImplementation(async () => ({
			session: 'new-session',
			isStudent: true
		}))
		logoutMock.mockReset()
		logoutMock.mockImplementation(async () => true)
		loadSecureAsyncMock.mockClear()
		saveSecureAsyncMock.mockClear()
		deleteSecureMock.mockClear()
	})

	it('callWithSession - Should throw NoSessionError when no session exists', async () => {
		await expect(
			sessionHandler.callWithSession(async () => 'ok')
		).rejects.toBeInstanceOf(sessionHandler.NoSessionError)
	})

	it('callWithSession - Should throw UnavailableSessionError for guest sessions', async () => {
		secureStore.set('session', 'guest')

		await expect(
			sessionHandler.callWithSession(async () => 'ok')
		).rejects.toBeInstanceOf(sessionHandler.UnavailableSessionError)
	})

	it('callWithSession - Should use the existing session when it is still fresh', async () => {
		secureStore.set('session', 'fresh-session')
		mmkvStore.set('sessionCreated', Date.now().toString())

		const result = await sessionHandler.callWithSession(async (session) => {
			expect(session).toBe('fresh-session')
			return 'done'
		})

		expect(result).toBe('done')
		expect(loginMock).not.toHaveBeenCalled()
	})

	it('callWithSession - Concurrent expired calls should trigger exactly one login', async () => {
		secureStore.set('session', 'old-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', '0')

		let resolveLogin!: (value: { session: string; isStudent: boolean }) => void
		const loginGate = new Promise<{ session: string; isStudent: boolean }>(
			(resolve) => {
				resolveLogin = resolve
			}
		)

		loginMock.mockImplementation(async () => await loginGate)

		const calls = [
			sessionHandler.callWithSession(async (session) => `a:${session}`),
			sessionHandler.callWithSession(async (session) => `b:${session}`),
			sessionHandler.callWithSession(async (session) => `c:${session}`)
		]

		// Wait until the shared refresh has entered API.login
		const started = Date.now()
		while (loginMock.mock.calls.length === 0) {
			if (Date.now() - started > 2000) {
				throw new Error('Timed out waiting for API.login')
			}
			await Bun.sleep(10)
		}

		expect(loginMock).toHaveBeenCalledTimes(1)
		resolveLogin({ session: 'shared-session', isStudent: true })

		await expect(Promise.all(calls)).resolves.toEqual([
			'a:shared-session',
			'b:shared-session',
			'c:shared-session'
		])
		expect(loginMock).toHaveBeenCalledTimes(1)
		expect(secureStore.get('session')).toBe('shared-session')
	})

	it('callWithSession - Failed credential refresh should throw NoSessionError', async () => {
		secureStore.set('session', 'old-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', '0')

		loginMock.mockImplementation(async () => {
			throw new APIError(-1, 'Wrong credentials')
		})

		await expect(
			sessionHandler.callWithSession(async () => 'ok')
		).rejects.toBeInstanceOf(sessionHandler.NoSessionError)
	})

	it('callWithSession - Session error from method should refresh once and retry', async () => {
		secureStore.set('session', 'stale-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', Date.now().toString())

		loginMock.mockImplementation(async () => ({
			session: 'recovered-session',
			isStudent: true
		}))

		let attempts = 0
		const result = await sessionHandler.callWithSession(async (session) => {
			attempts += 1
			if (attempts === 1) {
				expect(session).toBe('stale-session')
				throw new APIError(-1, 'No Session')
			}
			expect(session).toBe('recovered-session')
			return 'recovered'
		})

		expect(result).toBe('recovered')
		expect(loginMock).toHaveBeenCalledTimes(1)
		expect(attempts).toBe(2)
	})

	it('callWithSession - Unrelated method errors should not trigger a refresh', async () => {
		secureStore.set('session', 'fresh-session')
		mmkvStore.set('sessionCreated', Date.now().toString())

		await expect(
			sessionHandler.callWithSession(async () => {
				throw new Error('Lecture details unavailable')
			})
		).rejects.toThrow('Lecture details unavailable')

		expect(loginMock).not.toHaveBeenCalled()
	})
})
