import { Platform } from 'react-native'
import { type Detent, programmatic } from '@/components/Universal/bottom-sheet'

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

export function detentHeight(detent: Detent | undefined): number {
	if (typeof detent === 'number') {
		return detent
	}
	if (detent == null || detent === 'content') {
		return 0
	}
	return typeof detent.value === 'number' ? detent.value : 0
}

export function getMapSearchDetents(height: number): Detent[] {
	const fractions =
		Platform.OS === 'ios' ? [0, 0.2, 0.39, 0.9] : [0, 0.1, 0.3, 0.92]
	return fractions.map((fraction, index) => {
		const value = fraction * windowHeight(height)
		return index === SEARCH_HIDDEN ? programmatic(value) : value
	})
}

export function getMapDetailDetents(height: number): number[] {
	const fractions =
		Platform.OS === 'ios' ? [0, 0.39, 0.57, 0.85] : [0, 0.3, 0.4, 0.7]
	return fractions.map((fraction) => fraction * windowHeight(height))
}
