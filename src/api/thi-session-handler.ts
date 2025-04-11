import {
	deleteSecure,
	loadSecureAsync,
	saveSecureAsync,
	storage
} from '@/utils/storage'
import { Platform } from 'react-native'

import API from './anonymous-api'

const SESSION_EXPIRES = 3 * 60 * 60 * 1000

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
	password: string,
	stayLoggedIn: boolean
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
	if (stayLoggedIn) {
		await saveSecureAsync('username', username)
		await saveSecureAsync('password', password)
	}
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
	const sessionPromise = loadSecureAsync('session')
	const sessionCreated = Number.parseInt(
		storage.getString('sessionCreated') ?? '0'
	)

	// Await the session Promise
	const session = await sessionPromise

	// redirect user if he never had a session
	if (session == null) {
		throw new NoSessionError()
	}
	if (session === 'guest') {
		throw new UnavailableSessionError()
	}

	const usernamePromise = loadSecureAsync('username')
	const passwordPromise = loadSecureAsync('password')

	// Await the username and password Promises
	const username = await usernamePromise
	const password = await passwordPromise

	if (Platform.OS === 'web') {
		if (session === 'guest' || session == null) {
			throw new NoSessionError()
		}
	} else {
		if (username === null) {
			throw new UnavailableSessionError()
		}

		if (password === null) {
			throw new UnavailableSessionError()
		}
	}
	// log in if the session is older than SESSION_EXPIRES
	if (
		sessionCreated + SESSION_EXPIRES < Date.now() &&
		username != null &&
		password != null
	) {
		try {
			console.debug('old session, logging in...')
			const { session: newSession, isStudent } = await API.login(
				username,
				password
			)
			const updatedSession = newSession

			await saveSecureAsync('session', updatedSession)
			storage.set('sessionCreated', Date.now().toString())
			storage.set('isStudent', isStudent.toString())

			// Use the updated session
			return await method(updatedSession)
		} catch {
			throw new NoSessionError()
		}
	}

	// otherwise attempt to call the method and see if it throws a session error
	try {
		if (session !== null) {
			return await method(session)
		}
	} catch (e: unknown) {
		// the backend can throw different errors such as 'No Session' or 'Session Is Over'
		if (e instanceof Error && /session/i.test(e.message)) {
			if (username != null && password != null) {
				console.debug(
					'seems to have received a session error trying to get a new session!'
				)
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
				} catch {
					throw new NoSessionError()
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
	const sessionPromise = loadSecureAsync('session')
	const session = await sessionPromise

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
}
