import { Platform } from 'react-native'
import {
	deleteSecure,
	loadSecureAsync,
	saveSecureAsync,
	storage
} from '@/utils/storage'

import API from './anonymous-api'

const SESSION_EXPIRES = 3 * 60 * 60 * 1000

// List of known session-related error messages for more precise detection
const SESSION_ERROR_PATTERNS = [
	/session/i,
	/login/i,
	/authentication/i,
	/not authorized/i,
	/unauthorized/i,
	/wrong credentials/i
]

/**
 * Checks if an error is related to session issues
 */
const isSessionError = (error: Error): boolean => {
	return SESSION_ERROR_PATTERNS.some((pattern) => pattern.test(error.message))
}

/**
 * Thrown when the user is not logged in.
 */
export class NoSessionError extends Error {
	constructor() {
		super('User is not logged in')
	}
}

/**
 * Thrown when the user is logged in as a guest.
 */
export class UnavailableSessionError extends Error {
	constructor() {
		super('User is logged in as guest')
	}
}

/**
 * Logs in the user and persists the session to AsyncStorage
 */
export async function createSession(
	username: string,
	password: string
): Promise<boolean> {
	// convert to lowercase just to be safe
	// (the API used to show weird behavior when using upper case usernames)
	let modifiedUsername = username.toLowerCase()
	// strip domain if user entered an email address
	modifiedUsername = modifiedUsername.replace(/@thi\.de$/, '')
	// strip username to remove whitespaces
	modifiedUsername = modifiedUsername.replace(/\s/g, '')
	const { session, isStudent } = await API.login(modifiedUsername, password)

	if (typeof session !== 'string') {
		throw new Error('Session is not a string')
	}

	storage.set('sessionCreated', Date.now().toString())
	await saveSecureAsync('session', session)
	await saveSecureAsync('username', username)
	await saveSecureAsync('password', password)
	return isStudent
}

/**
 * Logs in the user as a guest.
 */
export async function createGuestSession(forget = true): Promise<void> {
	if (forget) {
		await forgetSession()
	}
	await saveSecureAsync('session', 'guest')
}

/**
 * Calls a method with a session. If the session turns out to be invalid,
 * it attempts to fetch a new session and calls the method again.
 *
 * If a session cannot be obtained, a NoSessionError is thrown.
 *
 * @param {object} method Method which will receive the session token
 * @returns {*} Value returned by `method`
 */
export async function callWithSession<T>(
	method: (session: string) => Promise<T>
): Promise<T> {
	const session = await loadSecureAsync('session')
	const sessionCreated = Number.parseInt(
		storage.getString('sessionCreated') ?? '0'
	)

	if (session == null) {
		throw new NoSessionError()
	}
	if (session === 'guest') {
		throw new UnavailableSessionError()
	}

	let username = await loadSecureAsync('username')
	const password = await loadSecureAsync('password')

	if (Platform.OS === 'web') {
		if (session === 'guest' || session == null) {
			throw new NoSessionError()
		}
	} else {
		if (username === null || username === '') {
			throw new UnavailableSessionError()
		}

		if (password === null || password === '') {
			throw new UnavailableSessionError()
		}
	}

	// adresses prior bug where username is an email address
	username = username!.replace(/@thi\.de$/, '')
	username = username!.replace(/\s/g, '')

	if (
		sessionCreated + SESSION_EXPIRES < Date.now() &&
		username != null &&
		password != null
	) {
		try {
			console.debug('Old session expired, logging in again...')
			const { session: newSession, isStudent } = await API.login(
				username,
				password
			)
			const updatedSession = newSession

			await saveSecureAsync('session', updatedSession)
			storage.set('sessionCreated', Date.now().toString())
			storage.set('isStudent', isStudent.toString())

			return await method(updatedSession)
		} catch (loginError) {
			if (loginError instanceof Error && isSessionError(loginError)) {
				throw new NoSessionError()
			}
			throw loginError // Re-throw the original error
		}
	}

	// otherwise attempt to call the method and see if it throws a session error
	try {
		if (session !== null) {
			return await method(session)
		}
	} catch (e: unknown) {
		// the backend can throw different errors such as 'No Session' or 'Session Is Over'
		if (e instanceof Error && isSessionError(e)) {
			if (username != null && password != null) {
				console.debug('Received a session error, trying to get a new session!')
				try {
					const { session: newSession, isStudent } = await API.login(
						username,
						password
					)
					const updatedSession = newSession
					await saveSecureAsync('session', updatedSession)
					storage.set('sessionCreated', Date.now().toString())
					storage.set('isStudent', isStudent.toString())

					return await method(updatedSession)
				} catch (loginError) {
					if (loginError instanceof Error && isSessionError(loginError)) {
						throw new NoSessionError()
					}
					throw loginError
				}
			}
			throw new NoSessionError()
		}
		throw e
	}
	return undefined as never
}

/**
 * Logs out the user by deleting the session from localStorage.
 */
export async function forgetSession(): Promise<void> {
	const session = await loadSecureAsync('session')

	if (session === null) {
		console.debug('No session to forget')
	} else {
		try {
			await API.logout(session)
		} catch (e) {
			console.error(e)
		}
	}

	await Promise.all([
		deleteSecure('session'),
		deleteSecure('username'),
		deleteSecure('password')
	])

	// clear the general storage (cache)
	try {
		storage.clearAll()
	} catch (e) {
		console.error(e)
	}

	// Clean up IndexedDB on web platforms
	if (Platform.OS === 'web' && typeof window !== 'undefined') {
		try {
			// Clean up the credential storage database
			if (window.indexedDB) {
				// Get all databases and delete any related to our app
				if (window.indexedDB.databases) {
					const databases = await window.indexedDB.databases()
					for (const db of databases) {
						if (
							db.name &&
							(db.name.includes('neuland') ||
								db.name.includes('secure-storage'))
						) {
							window.indexedDB.deleteDatabase(db.name)
							console.debug(`Deleted IndexedDB database: ${db.name}`)
						}
					}
				} else {
					// Fallback for browsers without databases() support
					const knownDBs = ['neuland-secure-storage']
					for (const dbName of knownDBs) {
						window.indexedDB.deleteDatabase(dbName)
						console.debug(`Deleted IndexedDB database: ${dbName}`)
					}
				}
			}
		} catch (error) {
			console.error('Failed to clean up IndexedDB:', error)
		}
	}
}
