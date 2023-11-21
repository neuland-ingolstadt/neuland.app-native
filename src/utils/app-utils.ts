import { router } from 'expo-router'
// @ts-expect-error: rn-quick-actions is not typed
import { type ShortcutItem } from 'rn-quick-actions'

/**
 * Converts a version string in the format x.y.z to x.y.
 * @param version - The version string to convert.
 * @returns The major.minor version string.
 */
export const convertToMajorMinorPatch = (version: string): string => {
    return version.split('.').slice(0, 2).join('.')
}

/**
 * Processes a shortcut item and navigates to the associated path.
 * @param item - The shortcut item to process.
 */
export function processShortcut(item: ShortcutItem): void {
    console.log('Processing shortcut', item)
    router.replace(item.data.path)
}

/**
 * Capitalizes the first letter of a string.
 * @param string - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
