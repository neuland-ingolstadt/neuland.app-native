import type { QueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import API from '@/api/thi-authenticated-api'
import { createGuestSession } from '@/api/thi-session'
import { USER_GUEST } from '@/data/constants'
import courseShortNames from '@/data/course-short-names.json'
import type { CourseShortNames } from '@/types/data'
import type { PersDataDetails } from '@/types/thi-api'

import { loadSecureAsync } from './storage'

export const networkError = 'Network request failed'
export const guestError = 'User is logged in as guest'
export const permissionError = '"Service for user-group not defined" (-120)'
export const notLoggedInError = 'User is not logged in'
/** Sentinel for unknown API/client errors — always localize in ErrorView. */
export const unknownError = 'Unknown error'
/** App sentinel for empty food menus — localize in ErrorView. */
export const noMealsError = 'noMeals'

/**
 * Removes the quotation marks and the error code from the error message.
 * @param str The error message string to be trimmed.
 * @returns The trimmed error message string.
 */
export const trimErrorMsg = (str: string): string => {
	const match = /"([^"]*)"/.exec(str)
	if (match !== null) {
		return match[1].trim()
	}
	return str
}

/**
 * Maps a thrown/query error to an ErrorView title sentinel.
 * Known auth/network errors stay as-is; raw API messages become {@link unknownError}
 * so the UI never shows English backend text to users.
 */
export const toErrorViewTitle = (error: unknown): string => {
	if (error == null) {
		return unknownError
	}

	const message =
		typeof error === 'string'
			? error
			: error instanceof Error
				? error.message
				: unknownError

	if (message.length === 0) {
		return unknownError
	}

	if (isKnownError(message) || message === noMealsError) {
		return message
	}

	return unknownError
}

/**
 * Detects THI/APIError-style titles like `"message" (-120)` or `{…} (500)`.
 * Used as a safety net when a raw API message still reaches ErrorView.
 */
export const isRawApiErrorTitle = (title: string): boolean => {
	if (isKnownError(title) || title === unknownError || title === noMealsError) {
		return false
	}
	return /\(\s*-?\d+\s*\)\s*$/.test(title)
}

/**
 * Gets the username of the user from the secure store.
 * @returns A Promise that resolves to the username of the user.
 */
export async function getUsername(): Promise<string> {
	try {
		const username = await loadSecureAsync('username')
		return username ?? ''
	} catch (e) {
		console.error(e)
		return ''
	}
}

export const performLogout = async (
	toggleUser: (user: undefined) => void,
	resetDashboard: (userKind: string) => void,
	queryClient: QueryClient
): Promise<void> => {
	try {
		toggleUser(undefined)

		resetDashboard(USER_GUEST)
		await createGuestSession()
		queryClient.clear()
		router.navigate('/(tabs)')
	} catch (e) {
		console.debug(e)
	}
}

/**
 * Checks if the error message is a known error.
 * @param error The error to be checked.
 * @returns True if the error is known, false otherwise.
 */
export const isKnownError = (error: Error | string): boolean => {
	const errorString = typeof error === 'string' ? error : error.message
	return (
		errorString === networkError ||
		errorString === guestError ||
		errorString === permissionError ||
		errorString === notLoggedInError
	)
}

/**
 * Fetches the personal data of the user.
 * @returns The personal data of the user.
 */
export async function getPersonalData(): Promise<PersDataDetails> {
	const response = await API.getPersonalData()
	const data: PersDataDetails = response.persdata
	data.pcounter = response.pcounter
	return data
}

/**
 * Determines the users SPO version.
 * @param {PersonalDataDetails} data Personal data
 * @returns {string}
 */
export function extractSpoName(data: PersDataDetails): string | null {
	if (data?.po_url == null) {
		return null
	}

	const split = data.po_url.split('/').filter((x) => x.length > 0)
	return split[split.length - 1]
}

/**
 * Determines the users faculty.
 * @param {PersonalData} data Personal data
 * @returns {string} Faculty name (e.g. `Informatik`) or null
 */
export function extractFaculty(
	data: PersDataDetails | undefined
): string | null {
	if (data?.stg == null) {
		return null
	}
	const shortNames: CourseShortNames = courseShortNames
	const shortName = data.stg
	const faculty = Object.keys(shortNames).find((faculty) =>
		(courseShortNames as Record<string, string[]>)[faculty].includes(shortName)
	)

	return faculty ?? null
}
