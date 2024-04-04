import API from '@/api/authenticated-api'
import { createGuestSession } from '@/api/thi-session-handler'
import { queryClient } from '@/components/provider'
import courseShortNames from '@/data/course-short-names.json'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { type CourseShortNames } from '@/types/data'
import { type PersDataDetails } from '@/types/thi-api'
import { router } from 'expo-router'
import { getItemAsync } from 'expo-secure-store'

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
    toggleAccentColor: (color: string) => void,
    resetDashboard: (userKind: string) => void
): Promise<void> => {
    try {
        toggleUser(undefined)
        toggleAccentColor('blue')
        resetDashboard(USER_GUEST)
        queryClient.clear()
        router.navigate('(tabs)')
        await createGuestSession()
    } catch (e) {
        console.log(e)
    }
}

export const networkError = 'Network request failed'
export const guestError = 'User is logged in as guest'
export const permissionError = '"Service for user-group not defined" (-120)'

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

export async function getPersonalData(): Promise<PersDataDetails> {
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
