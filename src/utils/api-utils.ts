import API from '@/api/authenticated-api'
import { createGuestSession } from '@/api/thi-session-handler'
import courseShortNames from '@/data/course-short-names.json'
import { type CourseShortNames } from '@/types/data'
import { type PersDataDetails } from '@/types/thi-api'
import { type QueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { getItemAsync } from 'expo-secure-store'

import { USER_GUEST } from './app-utils'

export const networkError = 'Network request failed'
export const guestError = 'User is logged in as guest'
export const permissionError = '"Service for user-group not defined" (-120)'
/**
 * Removes the quotation marks and the error code from the error message.
 * @param str The error message string to be trimmed.
 * @returns The trimmed error message string.
 */
export const trimErrorMsg = (str: string): string => {
    const match = str.match(/"([^"]*)"/)
    if (match !== null) {
        return match[1].trim()
    } else {
        return str
    }
}

/**
 * Gets the username of the user from the secure store.
 * @returns The username of the user.
 */
export async function getUsername(): Promise<string> {
    let username = ''
    try {
        username = (await getItemAsync('username')) ?? ''
    } catch (e) {
        console.log(e)
    }
    return username
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
        router.navigate('/')
    } catch (e) {
        console.log(e)
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
        errorString === permissionError
    )
}

/**
 * Fetches the personal data of the user.
 * @returns The personal data of the user.
 */
export async function getPersonalData(): Promise<PersDataDetails> {
    console.log('Fetching personal data')
    const response = await API.getPersonalData()
    const data: PersDataDetails = response.persdata
    data.pcounter = response.pcounter
    return data
}

/**
 * Determines the users faculty.
 * @param {PersonalData} data Personal data
 * @returns {string} Faculty name (e.g. `Informatik`)
 */
export function extractFacultyFromPersonal(
    data: PersDataDetails
): string | undefined {
    if (data?.stg == null) {
        console.error('No personal data found')
        return undefined
    }
    const shortNames: CourseShortNames = courseShortNames
    const shortName = data.stg
    const faculty = Object.keys(shortNames).find((faculty) =>
        (courseShortNames as Record<string, string[]>)[faculty].includes(
            shortName
        )
    )
    return faculty
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
 * @returns {string} Faculty name (e.g. `Informatik`)
 */
export function extractFacultyFromPersonalData(
    data: PersDataDetails | undefined
): string | null {
    if (data?.stg == null) {
        return null
    }
    const shortNames: CourseShortNames = courseShortNames
    const shortName = data.stg
    const faculty = Object.keys(shortNames).find((faculty) =>
        (courseShortNames as Record<string, string[]>)[faculty].includes(
            shortName
        )
    )

    return faculty ?? null
}
