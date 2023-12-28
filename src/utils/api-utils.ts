import { createGuestSession } from '@/api/thi-session-handler'
import { router } from 'expo-router'

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

export const performLogout = async (
    toggleUser: (user: undefined) => void
): Promise<void> => {
    try {
        await createGuestSession()
        toggleUser(undefined)
        router.navigate('(tabs)')
    } catch (e) {
        console.log(e)
    }
}
