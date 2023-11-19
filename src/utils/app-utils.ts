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
    router.replace(item.data.path)
}
