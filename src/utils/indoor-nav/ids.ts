/** Default outdoor entrance for building G (Haupteingang, legacy default). */
export const INDOOR_DEFAULT_ENTRANCE_RAW_ID = 'IN-G-E01'

/**
 * Numeric-aware asset id comparison: E2 < E10, D2 < D10.
 * Used to pick the lowest-numbered door / entrance of a building.
 */
export function compareAssetIds(a: string, b: string): number {
	return a.localeCompare(b, undefined, { numeric: true })
}

/** Lowest-numbered id (numeric-aware), or undefined when empty. */
export function lowestAssetId(ids: string[]): string | undefined {
	let best: string | undefined
	for (const id of ids) {
		if (best === undefined || compareAssetIds(id, best) < 0) {
			best = id
		}
	}
	return best
}

export function roomNodeId(floor: string, raum: string): string {
	return `room:${floor}:${raum}`
}

export function doorNodeId(id: string): string {
	return `door:${id}`
}

export function entranceNodeId(id: string): string {
	return `entrance:${id}`
}

export function portalNodeId(floor: string, a: string, b: string): string {
	const [x, y] = [a, b].sort((left, right) => left.localeCompare(right))
	return `portal:${floor}:${x}-${y}`
}

export const INDOOR_DEFAULT_START_ID = entranceNodeId(
	INDOOR_DEFAULT_ENTRANCE_RAW_ID
)
