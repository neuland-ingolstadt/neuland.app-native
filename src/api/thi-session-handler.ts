import { storage } from '@/utils/storage'
import * as SecureStore from 'expo-secure-store'

import API from './anonymous-api'

const SESSION_EXPIRES = 3 * 60 * 60 * 1000

async function save(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value)
}

function load(key: string): string | null {
    return SecureStore.getItem(key)
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
    password: string,
    stayLoggedIn: boolean
): Promise<boolean> {
    // convert to lowercase just to be safe
    // (the API used to show weird behavior when using upper case usernames)
    username = username.toLowerCase()
    // strip domain if user entered an email address
    username = username.replace(/@thi\.de$/, '')
    // strip username to remove whitespaces
    username = username.replace(/\s/g, '')
    const { session, isStudent } = await API.login(username, password)

    if (typeof session !== 'string') {
        throw new Error('Session is not a string')
    }

    storage.set('sessionCreated', Date.now().toString())

    await save('session', session)
    if (stayLoggedIn) {
        await save('username', username)
        await save('password', password)
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
    await save('session', 'guest')
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
    let session = load('session')
    const sessionCreated = parseInt(storage.getString('sessionCreated') ?? '0')
    // redirect user if he never had a session
    if (session == null) {
        throw new NoSessionError()
    } else if (session === 'guest') {
        throw new UnavailableSessionError()
    }

    const username = load('username')
    if (username === null) {
        throw new UnavailableSessionError()
    }

    const password = load('password')
    if (password === null) {
        throw new UnavailableSessionError()
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
            session = newSession

            await save('session', session)
            storage.set('sessionCreated', Date.now().toString())
            storage.set('isStudent', isStudent.toString())
        } catch (e) {
            throw new NoSessionError()
        }
    }

    // otherwise attempt to call the method and see if it throws a session error

    try {
        if (session !== null) {
            return await method(session)
        }
    } catch (e: any) {
        // the backend can throw different errors such as 'No Session' or 'Session Is Over'
        if (/session/i.test(e.message as string)) {
            if (username != null && password != null) {
                console.debug(
                    'seems to have received a session error trying to get a new session!'
                )
                try {
                    const { session: newSession, isStudent } = await API.login(
                        username,
                        password
                    )
                    session = newSession
                    await save('session', session)
                    storage.set('sessionCreated', Date.now().toString())
                    storage.set('isStudent', isStudent.toString())
                } catch (e) {
                    throw new NoSessionError()
                }
                return await method(session)
            } else {
                throw new NoSessionError()
            }
        } else {
            throw e
        }
    }
    return undefined as any
}

/**
 * Obtains a session, either directly from localStorage or by logging in
 * using saved credentials.
 *
 * If a session cannot be obtained, the user is redirected to /login.
 *
 * @param {object} router Next.js router object
 */
export async function obtainSession(router: object): Promise<string | null> {
    let session = load('session')
    const age = parseInt(storage.getString('sessionCreated') ?? '0')

    const username = load('username')
    const password = load('password')

    // invalidate expired session
    if (age + SESSION_EXPIRES < Date.now() || !(await API.isAlive(session))) {
        console.debug('Invalidating session')

        session = null
    }

    // try to log in again
    if (session == null && username != null && password != null) {
        try {
            console.debug('Logging in again')
            const { session: newSession, isStudent } = await API.login(
                username,
                password
            )
            session = newSession
            await save('session', session)
            storage.set('sessionCreated', Date.now().toString())
            storage.set('isStudent', isStudent.toString())
        } catch (e) {
            console.debug('Failed to log in again')
            console.error(e)
        }
    }

    return session
}

/**
 * Logs out the user by deleting the session from localStorage.
 */
export async function forgetSession(): Promise<void> {
    const session = load('session')
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
        SecureStore.deleteItemAsync('session'),
        SecureStore.deleteItemAsync('username'),
        SecureStore.deleteItemAsync('password'),
    ])

    // clear all AsyncStorage data except analytics
    try {
        const keys = storage.getAllKeys()
        for (const key of keys) {
            if (
                key !== 'analytics' &&
                key !== 'isOnboardedv1' &&
                !key.startsWith('isUpdated-')
            ) {
                storage.delete(key)
            }
        }
    } catch (e) {
        console.error(e)
    }
}
