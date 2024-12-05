import {
    authenticateAsync,
    getEnrolledLevelAsync,
} from 'expo-local-authentication'
import { type RelativePathString, router } from 'expo-router'

/**
 * Converts a version string in the format x.y.z to x.y.
 * @param version - The version string to convert.
 * @returns The major.minor version string.
 */
export const convertToMajorMinorPatch = (version: string): string => {
    return version.split('.').slice(0, 2).join('.')
}

/**
 * Capitalizes the first letter of a string.
 * @param string - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Lowercases the first letter of a string.
 * @param string - The string to lowercase.
 * @returns The string with the first letter lowercased.
 */
export function lowercaseFirstLetter(string: string): string {
    return string.charAt(0).toLowerCase() + string.slice(1)
}

/**
 * Checks if two arrays are equal.
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns A boolean indicating whether the arrays are equal.
 */
export function arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}

/**
 * Handles biometric authentication for a given path.
 * @param path - The path to navigate to after successful authentication.
 */
export const handleBiometricAuth = async (path: string): Promise<void> => {
    const securityLevel = await getEnrolledLevelAsync()
    if (securityLevel === 0) {
        // no passcode or biometric auth set up
        router.navigate(path as RelativePathString)
        return
    }

    const biometricAuth = await authenticateAsync({
        promptMessage: 'Verify your identity to show your grades',
        fallbackLabel: 'Enter Passcode',
    })

    if (biometricAuth.success) {
        router.navigate(path as RelativePathString)
    }
}
