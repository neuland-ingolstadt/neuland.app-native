import type { FloorId } from './types'

export const FLOORS: FloorId[] = ['EG', '1', '2', '3']

/**
 * Floors to iterate: the dataset's own floors, falling back to the legacy
 * stack when empty.
 */
export function activeFloors(floors: string[]): string[] {
	return floors.length > 0 ? floors : [...FLOORS]
}

/** Numeric level of a floor label: EG → 0, plain numbers parse, else NaN. */
export function floorLevel(floor: string): number {
	if (floor === 'EG') {
		return 0
	}
	const parsed = Number.parseFloat(floor.replace(',', '.'))
	return Number.isFinite(parsed) ? parsed : Number.NaN
}

/** Finite numeric level, falling back to ground (EG) for unknown labels. */
export function finiteFloorLevel(floor: string): number {
	const level = floorLevel(floor)
	return Number.isFinite(level) ? level : 0
}

/**
 * Order floor labels bottom-up: EG at ground, numerics ascending
 * (basements below EG), unknown labels last. Deduplicates input.
 */
export function orderFloors(floors: string[]): string[] {
	return [...new Set(floors)].sort((a, b) => {
		const levelA = floorLevel(a)
		const levelB = floorLevel(b)
		const finiteA = Number.isFinite(levelA)
		const finiteB = Number.isFinite(levelB)
		if (finiteA && finiteB) {
			return levelA - levelB || a.localeCompare(b, 'de')
		}
		if (finiteA) {
			return -1
		}
		if (finiteB) {
			return 1
		}
		return a.localeCompare(b, 'de')
	})
}
