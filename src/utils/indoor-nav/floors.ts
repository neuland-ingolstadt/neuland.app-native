import type { FloorId } from './types'

export const FLOORS: FloorId[] = ['EG', '1', '2', '3']
export const FLOOR_ORDER: Record<string, number> = {
	EG: 0,
	'1': 1,
	'2': 2,
	'3': 3
}

/** 'up' when toFloor is at/above fromFloor (>= keeps same-floor edges 'up'). */
export function stairDirection(
	fromFloor: string,
	toFloor: string,
	sameFloor: 'up' | 'down' = 'up'
): 'up' | 'down' {
	const from = FLOOR_ORDER[fromFloor] ?? 0
	const to = FLOOR_ORDER[toFloor] ?? 0
	if (to === from) {
		return sameFloor
	}
	return to > from ? 'up' : 'down'
}
