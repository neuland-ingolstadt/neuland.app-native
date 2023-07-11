/**
 * Generates the initials of a given name.
 * @param name The name to generate the initials from.
 * @returns The initials of the name.
 */
export function getInitials(name: string): string {
    const names = name.split(' ')
    const firstName = names[0] ?? ''
    const lastName = names[names.length - 1] ?? ''

    let initials = (firstName.charAt(0) ?? '') + (lastName.charAt(0) ?? '')
    initials = initials.toUpperCase()

    return initials
}

/**
 * Generates a hexadecimal color code based on the given name.
 * @param name The name to generate the color from.
 * @returns The hexadecimal color code.
 */
export function getNameColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    let colour = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff
        colour += ('00' + value.toString(16)).substr(-2)
    }
    return colour
}

/**
 * Calculates the appropriate text color (black or white) based on the given background color.
 * @param background The background color in hexadecimal format (#RRGGBB).
 * @returns The appropriate text color (black or white).
 */
export function getContrastColor(background: string): string {
    const r = parseInt(background.substr(1, 2), 16)
    const g = parseInt(background.substr(3, 2), 16)
    const b = parseInt(background.substr(5, 2), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? 'black' : 'white'
}
