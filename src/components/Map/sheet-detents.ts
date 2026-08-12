import { Platform } from 'react-native'

export const SEARCH_HIDDEN = 0
export const SEARCH_PEEK = 1
export const SEARCH_HALF = 2
export const SEARCH_FULL = 3

export const DETAIL_HIDDEN = 0
export const DETAIL_OPEN = 1

const FALLBACK_WINDOW_HEIGHT = 800

function windowHeight(height: number): number {
	return height > 0 ? height : FALLBACK_WINDOW_HEIGHT
}

export function getMapSearchDetents(height: number): number[] {
	const fractions =
		Platform.OS === 'ios' ? [0, 0.2, 0.39, 0.9] : [0, 0.1, 0.3, 0.92]
	return fractions.map((fraction) => fraction * windowHeight(height))
}

export function getMapDetailDetents(height: number): number[] {
	const fractions =
		Platform.OS === 'ios' ? [0, 0.39, 0.57, 0.85] : [0, 0.3, 0.4, 0.7]
	return fractions.map((fraction) => fraction * windowHeight(height))
}
