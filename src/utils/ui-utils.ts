import { Platform } from 'react-native'

/**
 * Generates the initials of a given name.
 * @param name The name to generate the initials from.
 * @returns The initials of the name.
 * @example
 * // Usage
 * const initials = getInitials('John Doe')
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
 * @example
 * // Usage
 * const color = getNameColor('John Doe')
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
 * @example
 * // Usage
 * const textColor = getContrastColor('#ff0000')
 */
export const getContrastColor = (background: string): string => {
    const hex = background.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? '#000000' : '#ffffff'
}

/**
 * Lightens a color by the given percentage.
 * @param percentage The percentage to lighten the color by.
 * @param color The color to lighten in hexadecimal format (#RRGGBB).
 * @returns The lightened color in hexadecimal format (#RRGGBB).
 * @example
 * // Usage
 * const lightenedColor = lighten(0.2, '#ff0000')
 */
export const lighten = (percentage: number, color: string): string => {
    const rgb = color
        .replace(
            /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            (_, r, g, b) => r + r + g + g + b + b
        )
        .substring(1)
        .match(/.{2}/g)
        ?.map((x) => parseInt(x, 16)) ?? [0, 0, 0]

    const newRgb = rgb.map((c) => Math.round(c + (255 - c) * percentage))

    const newColor = `#${newRgb
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('')}`

    return newColor
}

/**
 * Returns the appropriate status bar style based on the platform. Used for Status Bar component in modal screens.
 * @returns The appropriate status bar style.
 * @example
 * // Usage
 * <StatusBar barStyle={getStatusBarStyle()} />
 */
export const getStatusBarStyle = (): 'light' | 'auto' => {
    return Platform.OS === 'ios' ? (Platform.isPad ? 'auto' : 'light') : 'auto'
}
