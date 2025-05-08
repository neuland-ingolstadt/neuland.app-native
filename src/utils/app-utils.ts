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
export function arraysEqual(arr1: unknown[], arr2: unknown[]): boolean {
	if (arr1.length !== arr2.length) return false
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false
	}
	return true
}
