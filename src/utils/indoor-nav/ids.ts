/** Default outdoor entrance for building G (Haupteingang). */
export const INDOOR_DEFAULT_ENTRANCE_RAW_ID = 'IN-G-E01'

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
