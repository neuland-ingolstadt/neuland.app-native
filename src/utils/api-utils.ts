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
