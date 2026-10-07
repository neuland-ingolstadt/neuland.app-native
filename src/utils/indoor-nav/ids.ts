/** Default outdoor entrance for building G (Haupteingang). */
export const INDOOR_DEFAULT_ENTRANCE_RAW_ID = 'IN-G-E01'

/** Main entrance per mapped building — routing starts at the destination's building. */
export const INDOOR_DEFAULT_ENTRANCES: Record<string, string> = {
	G: 'IN-G-E01',
	J: 'IN-J-E01',
	K: 'IN-K-E01',
	W: 'IN-W-E01'
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

/** Entrance node id for the given building's main entrance. */
export function defaultStartForBuilding(building: string): string {
	return entranceNodeId(
		INDOOR_DEFAULT_ENTRANCES[building] ?? INDOOR_DEFAULT_ENTRANCE_RAW_ID
	)
}

export const INDOOR_DEFAULT_START_ID = entranceNodeId(
	INDOOR_DEFAULT_ENTRANCE_RAW_ID
)

const INDOOR_MAIN_ENTRANCE_RAW_IDS = new Set(
	Object.values(INDOOR_DEFAULT_ENTRANCES)
)

/** Mapped main entrance for a building (Haupteingang), not secondary doors. */
export function isMainEntranceRawId(rawId: string): boolean {
	return INDOOR_MAIN_ENTRANCE_RAW_IDS.has(rawId)
}

export function isMainEntranceNodeId(nodeId: string): boolean {
	if (!nodeId.startsWith('entrance:')) {
		return false
	}
	return isMainEntranceRawId(nodeId.slice('entrance:'.length))
}
