import { Platform } from 'react-native'
import {
	deleteSecure,
	loadSecureAsync,
	saveSecureAsync,
	storage
} from '@/utils/storage'

import API, { APIError } from './thi-api'

const SESSION_EXPIRES = 3 * 60 * 60 * 1000

/** Known THI / app messages that mean the session token is dead or credentials failed. */
const SESSION_ERROR_MARKERS = [
	'no session',
	'session is over',
	'wrong credentials',
	'not authenticated',
	'not authorized'
] as const

let refreshInFlight: Promise<string> | null = null

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

function errorText(error: Error): string {
	if (error instanceof APIError) {
		const data =
			typeof error.data === 'string' ? error.data : JSON.stringify(error.data)
		return `${data} ${error.message}`.toLowerCase()
	}
	return error.message.toLowerCase()
}

/**
 * Checks if an error is related to session issues
 */
const isSessionError = (error: Error): boolean => {
	const text = errorText(error)
	return SESSION_ERROR_MARKERS.some((marker) => text.includes(marker))
}

function normalizeUsername(username: string): string {
	return username.replace(/@thi\.de$/i, '').replace(/\s/g, '')
}

async function loadCredentials(): Promise<{
	username: string
	password: string
} | null> {
	const [rawUsername, password] = await Promise.all([
		loadSecureAsync('username'),
		loadSecureAsync('password')
	])

	if (rawUsername == null || rawUsername === '') {
		return null
	}
	if (password == null || password === '') {
		return null
	}

	return {
		username: normalizeUsername(rawUsername),
		password
	}
}

/**
 * Logs in once and persists the new session. Concurrent callers share the same promise.
 */
async function refreshSession(
	username: string,
	password: string
): Promise<string> {
	if (refreshInFlight != null) {
		return refreshInFlight
	}

	refreshInFlight = (async () => {
		console.debug('Refreshing THI session...')
		const { session, isStudent } = await API.login(username, password)

		if (typeof session !== 'string') {
			throw new Error('Session is not a string')
		}

		await saveSecureAsync('session', session)
		storage.set('sessionCreated', Date.now().toString())
		storage.set('isStudent', isStudent.toString())
		return session
	})().finally(() => {
		refreshInFlight = null
	})

	return refreshInFlight
}

async function refreshOrThrow(): Promise<string> {
	const credentials = await loadCredentials()
	if (credentials == null) {
		throw new NoSessionError()
	}

	try {
		return await refreshSession(credentials.username, credentials.password)
	} catch (loginError) {
		if (loginError instanceof Error && isSessionError(loginError)) {
			throw new NoSessionError()
		}
		throw loginError
	}
}

/**
 * Logs in the user and persists the session (credentials in secure storage, expiry in MMKV)
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
	await Promise.all([
		saveSecureAsync('session', session),
		saveSecureAsync('username', modifiedUsername),
		saveSecureAsync('password', password)
	])
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
 * Concurrent refreshes share a single in-flight login (single-flight).
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

	if (session == null) {
		throw new NoSessionError()
	}
	if (session === 'guest') {
		throw new UnavailableSessionError()
	}

	const sessionCreated = Number.parseInt(
		storage.getString('sessionCreated') ?? '0',
		10
	)
	const isExpired = sessionCreated + SESSION_EXPIRES < Date.now()

	if (isExpired) {
		const credentials = await loadCredentials()
		if (credentials != null) {
			console.debug('Old session expired, logging in again...')
			const newSession = await refreshOrThrow()
			return await method(newSession)
		}
	}

	try {
		return await method(session)
	} catch (e: unknown) {
		if (!(e instanceof Error) || !isSessionError(e)) {
			throw e
		}

		console.debug('Received a session error, trying to get a new session!')
		const newSession = await refreshOrThrow()
		return await method(newSession)
	}
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
