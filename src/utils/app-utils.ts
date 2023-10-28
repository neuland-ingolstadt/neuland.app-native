/**
 * Converts a version string in the format x.y.z to x.y.
 * @param version - The version string to convert.
 * @returns The major.minor version string.
 */
export const convertToMajorMinorPatch = (version: string): string => {
    return version.split('.').slice(0, 2).join('.')
}
