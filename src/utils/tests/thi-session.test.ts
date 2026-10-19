import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { mockReactNative, reactNativePlatform } from './react-native-mock'
import {
	logoutMock,
	MockAPIError,
	resetThiApiMocks,
	thiApiMock
} from './thi-api-mocks'
import {
	deleteSecureMock,
	mmkvStore,
	resetSecureStores,
	secureStore,
	storageMock
} from './thi-storage-mocks'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

mockReactNative()

mock.module(`${SRC_ROOT}utils/storage.ts`, () => storageMock)
mock.module('@/utils/storage', () => storageMock)

mock.module(`${SRC_ROOT}api/thi-api.ts`, () => thiApiMock)
mock.module('@/api/thi-api', () => thiApiMock)

let sessionHandler: typeof import('../../api/thi-session')

beforeAll(async () => {
	sessionHandler = await import('../../api/thi-session')
})

describe('thi-session', () => {
	beforeEach(() => {
		reactNativePlatform.OS = 'web'
		resetSecureStores()
		resetThiApiMocks()
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
		expect(thiApiMock.default.login).not.toHaveBeenCalled()
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

		thiApiMock.default.login.mockImplementation(async () => await loginGate)

		const calls = [
			sessionHandler.callWithSession(async (session) => `a:${session}`),
			sessionHandler.callWithSession(async (session) => `b:${session}`),
			sessionHandler.callWithSession(async (session) => `c:${session}`)
		]

		const started = Date.now()
		while (thiApiMock.default.login.mock.calls.length === 0) {
			if (Date.now() - started > 2000) {
				throw new Error('Timed out waiting for API.login')
			}
			await Bun.sleep(10)
		}

		expect(thiApiMock.default.login).toHaveBeenCalledTimes(1)
		resolveLogin({ session: 'shared-session', isStudent: true })

		await expect(Promise.all(calls)).resolves.toEqual([
			'a:shared-session',
			'b:shared-session',
			'c:shared-session'
		])
		expect(thiApiMock.default.login).toHaveBeenCalledTimes(1)
		expect(secureStore.get('session')).toBe('shared-session')
	})

	it('callWithSession - Failed credential refresh should throw NoSessionError', async () => {
		secureStore.set('session', 'old-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', '0')

		thiApiMock.default.login.mockImplementation(async () => {
			throw new MockAPIError(-1, 'Wrong credentials')
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

		thiApiMock.default.login.mockImplementation(async () => ({
			session: 'recovered-session',
			isStudent: true
		}))

		let attempts = 0
		const result = await sessionHandler.callWithSession(async (session) => {
			attempts += 1
			if (attempts === 1) {
				expect(session).toBe('stale-session')
				throw new MockAPIError(-1, 'No Session')
			}
			expect(session).toBe('recovered-session')
			return 'recovered'
		})

		expect(result).toBe('recovered')
		expect(thiApiMock.default.login).toHaveBeenCalledTimes(1)
		expect(attempts).toBe(2)
	})

	it('callWithSession - Should reuse a fresher stored session instead of logging in again', async () => {
		secureStore.set('session', 'stale-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', Date.now().toString())

		let attempts = 0
		const result = await sessionHandler.callWithSession(async (session) => {
			attempts += 1
			if (attempts === 1) {
				expect(session).toBe('stale-session')
				// Simulate another concurrent call finishing a refresh first.
				secureStore.set('session', 'already-refreshed')
				mmkvStore.set('sessionCreated', Date.now().toString())
				throw new MockAPIError(-1, 'No Session')
			}
			expect(session).toBe('already-refreshed')
			return 'reused'
		})

		expect(result).toBe('reused')
		expect(thiApiMock.default.login).not.toHaveBeenCalled()
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

		expect(thiApiMock.default.login).not.toHaveBeenCalled()
	})

	it('callWithSession - Expired session without credentials should keep the old token', async () => {
		secureStore.set('session', 'old-session')
		mmkvStore.set('sessionCreated', '0')

		const result = await sessionHandler.callWithSession(async (session) => {
			expect(session).toBe('old-session')
			return 'kept'
		})

		expect(result).toBe('kept')
		expect(thiApiMock.default.login).not.toHaveBeenCalled()
	})

	it('callWithSession - Missing password should throw NoSessionError on session error', async () => {
		secureStore.set('session', 'stale-session')
		secureStore.set('username', 'alex.muster')
		mmkvStore.set('sessionCreated', Date.now().toString())

		await expect(
			sessionHandler.callWithSession(async () => {
				throw new MockAPIError(-1, 'Session is over')
			})
		).rejects.toBeInstanceOf(sessionHandler.NoSessionError)
	})

	it('callWithSession - Non-session login failures should bubble up', async () => {
		secureStore.set('session', 'old-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', '0')

		thiApiMock.default.login.mockImplementation(async () => {
			throw new Error('network down')
		})

		await expect(
			sessionHandler.callWithSession(async () => 'ok')
		).rejects.toThrow('network down')
	})

	it('callWithSession - Non-string refreshed session should throw', async () => {
		secureStore.set('session', 'old-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', '0')

		thiApiMock.default.login.mockImplementation(async () => ({
			session: 123 as unknown as string,
			isStudent: true
		}))

		await expect(
			sessionHandler.callWithSession(async () => 'ok')
		).rejects.toThrow('Session is not a string')
	})

	it('createSession - Should normalize the username and persist credentials', async () => {
		thiApiMock.default.login.mockImplementation(async (username, password) => {
			expect(username).toBe('alex.muster')
			expect(password).toBe('secret')
			return { session: 'created-session', isStudent: false }
		})

		await expect(
			sessionHandler.createSession('Alex.Muster@thi.de', 'secret')
		).resolves.toBe(false)

		expect(secureStore.get('session')).toBe('created-session')
		expect(secureStore.get('username')).toBe('alex.muster')
		expect(secureStore.get('password')).toBe('secret')
		expect(mmkvStore.get('sessionCreated')).toBeDefined()
	})

	it('createSession - Should reject a non-string session token', async () => {
		thiApiMock.default.login.mockImplementation(async () => ({
			session: null as unknown as string,
			isStudent: true
		}))

		await expect(
			sessionHandler.createSession('alex', 'secret')
		).rejects.toThrow('Session is not a string')
	})

	it('createGuestSession - Should clear the previous session by default', async () => {
		secureStore.set('session', 'old-session')
		secureStore.set('username', 'alex.muster')
		secureStore.set('password', 'secret')
		mmkvStore.set('sessionCreated', '1')

		await sessionHandler.createGuestSession()

		expect(logoutMock).toHaveBeenCalledWith('old-session')
		expect(secureStore.get('session')).toBe('guest')
		expect(secureStore.get('username')).toBeUndefined()
		expect(secureStore.get('password')).toBeUndefined()
		expect(mmkvStore.size).toBe(0)
	})

	it('createGuestSession - Should keep existing credentials when forget is false', async () => {
		secureStore.set('username', 'alex.muster')

		await sessionHandler.createGuestSession(false)

		expect(logoutMock).not.toHaveBeenCalled()
		expect(secureStore.get('session')).toBe('guest')
		expect(secureStore.get('username')).toBe('alex.muster')
	})

	it('forgetSession - Should no-op when there is no session', async () => {
		await sessionHandler.forgetSession()

		expect(logoutMock).not.toHaveBeenCalled()
		expect(deleteSecureMock).toHaveBeenCalledTimes(3)
	})

	it('forgetSession - Should swallow logout and clearAll failures', async () => {
		secureStore.set('session', 'old-session')
		logoutMock.mockImplementation(async () => {
			throw new Error('logout failed')
		})
		const originalClearAll = storageMock.storage.clearAll
		storageMock.storage.clearAll = () => {
			throw new Error('clear failed')
		}

		await expect(sessionHandler.forgetSession()).resolves.toBeUndefined()

		expect(secureStore.get('session')).toBeUndefined()
		storageMock.storage.clearAll = originalClearAll
	})

	it('forgetSession - Should clean IndexedDB databases on web', async () => {
		secureStore.set('session', 'old-session')
		const deleted: string[] = []
		const originalIndexedDB = globalThis.indexedDB

		Object.defineProperty(globalThis, 'indexedDB', {
			configurable: true,
			value: {
				databases: async () => [
					{ name: 'neuland-secure-storage' },
					{ name: 'unrelated-db' }
				],
				deleteDatabase: (name: string) => {
					deleted.push(name)
				}
			}
		})
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: globalThis
		})

		await sessionHandler.forgetSession()

		expect(deleted).toEqual(['neuland-secure-storage'])

		Object.defineProperty(globalThis, 'indexedDB', {
			configurable: true,
			value: originalIndexedDB
		})
		Reflect.deleteProperty(globalThis, 'window')
	})

	it('forgetSession - Should fall back to known DB names without databases()', async () => {
		secureStore.set('session', 'old-session')
		const deleted: string[] = []
		const originalIndexedDB = globalThis.indexedDB

		Object.defineProperty(globalThis, 'indexedDB', {
			configurable: true,
			value: {
				deleteDatabase: (name: string) => {
					deleted.push(name)
				}
			}
		})
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: globalThis
		})

		await sessionHandler.forgetSession()

		expect(deleted).toEqual(['neuland-secure-storage'])

		Object.defineProperty(globalThis, 'indexedDB', {
			configurable: true,
			value: originalIndexedDB
		})
		Reflect.deleteProperty(globalThis, 'window')
	})

	it('forgetSession - Should swallow IndexedDB cleanup failures', async () => {
		secureStore.set('session', 'old-session')
		const originalIndexedDB = globalThis.indexedDB

		Object.defineProperty(globalThis, 'indexedDB', {
			configurable: true,
			value: {
				databases: async () => {
					throw new Error('indexeddb unavailable')
				}
			}
		})
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: globalThis
		})

		await expect(sessionHandler.forgetSession()).resolves.toBeUndefined()

		Object.defineProperty(globalThis, 'indexedDB', {
			configurable: true,
			value: originalIndexedDB
		})
		Reflect.deleteProperty(globalThis, 'window')
	})
})
