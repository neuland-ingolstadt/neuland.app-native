import { trackEvent } from '@aptabase/react-native'
import { toast } from 'burnt'
import Color from 'color'
import * as Clipboard from 'expo-clipboard'
import { t } from 'i18next'
import { type ColorValue, Platform } from 'react-native'
export enum LoadingState {
	LOADING = 0,
	LOADED = 1,
	ERROR = 2,
	REFRESHING = 3
}

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
	if (names.length < 2) {
		return names[0].charAt(0).toUpperCase()
	}
	return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
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
	const r = Number.parseInt(hex.substring(0, 2), 16)
	const g = Number.parseInt(hex.substring(2, 4), 16)
	const b = Number.parseInt(hex.substring(4, 6), 16)
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
			(_, r: string, g: string, b: string): string => r + r + g + g + b + b
		)
		.substring(1)
		.match(/.{2}/g)
		?.map((x) => Number.parseInt(x, 16)) ?? [0, 0, 0]

	const newRgb = rgb.map((c) => Math.round(c + (255 - c) * percentage))

	const newColor = `#${newRgb
		.map((c) => c.toString(16).padStart(2, '0'))
		.join('')}`

	return newColor
}

export const roomNotFoundToast = (room: string, color: string): void => {
	trackEvent('RoomNotFound', { room })
	toast({
		title: t('toast.roomNotFound', { ns: 'common' }),
		message: room,
		preset: 'custom',
		haptic: 'error',
		duration: 3,
		from: 'top',
		icon: {
			ios: {
				name: 'exclamationmark.magnifyingglass',
				color
			}
		}
	})
}
export const pausedToast = (): void => {
	toast({
		title: t('toast.paused.title', { ns: 'common' }),
		message: t('toast.paused.description', { ns: 'common' }),
		preset: 'custom',
		duration: 2,
		from: 'top',
		icon: {
			ios: {
				name: 'wifi.slash',
				color: '#ed8422'
			}
		}
	})
}
export const getStatusBarStyle = (
	theme: 'light' | 'dark' | 'auto',
	isAndroid: boolean,
	isDark: boolean
): 'light' | 'dark' | 'auto' => {
	switch (theme) {
		case 'light':
			return 'dark'
		case 'dark':
			return 'light'
		default:
			return isAndroid ? (isDark ? 'light' : 'dark') : 'auto'
	}
}

export const inverseColor = (color: ColorValue): string => {
	let inverseColor: string

	if (color === '#ffffff' || color === '#000000') {
		// If primary color is white or black, adjust it slightly instead of inverting
		inverseColor = color === '#ffffff' ? '#c3edff' : '#4c8eaa'
	} else {
		// Otherwise, invert the color
		inverseColor = Color(color).negate().string()
	}
	return inverseColor
}

/**
 * Generates a random HSL color, which is vibrant and visible.
 * @returns A random HSL color.
 */
export function getRandomHSLColor(): string {
	function rand(min: number, max: number): number {
		return min + Math.random() * (max - min)
	}

	const h = rand(1, 360) // hue
	const s = rand(60, 100) // saturation
	const l = rand(30, 70) // lightness
	return `hsl(${h},${s}%,${l}%)`
}

export const copyToClipboard = async (
	text: string,
	message?: string
): Promise<void> => {
	if (text.length === 0) {
		return
	}
	await Clipboard.setStringAsync(text)
	// Android shows clipboard toast by default so we don't need to show it
	if (Platform.OS === 'android') {
		return
	}

	toast({
		title: t('toast.clipboard', {
			ns: 'common'
		}),
		message: message ?? text,
		preset: 'done',
		haptic: 'success',
		duration: 2,
		from: 'top'
	})
}
