import type { MapCoordinate } from '@/types/map'

export const MAP_CAMERA = {
	initialZoom: 16.5,
	focusZoom: 17,
	minZoom: 14,
	maxZoom: 19,
	focusPaddingGap: 12,
	resetDuration: 400,
	focusDuration: 500
} as const

export const INGOLSTADT_CENTER: MapCoordinate = [11.4328, 48.7663]
export const NEUBURG_CENTER: MapCoordinate = [11.17261, 48.732]

/** Overlay Standort values → display names. GeoJSON v2.6+ uses IN / ND. */
export const CAMPUS_LABELS: Record<string, string> = {
	IN: 'Ingolstadt',
	ND: 'Neuburg',
	Ingolstadt: 'Ingolstadt',
	Neuburg: 'Neuburg'
}

export function formatCampusLocation(standort: unknown): string | undefined {
	if (typeof standort !== 'string' || standort.length === 0) {
		return undefined
	}
	return CAMPUS_LABELS[standort] ?? standort
}
export const BUILDINGS_ALL = 'Alle'
export const BUILDINGS_IN = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'M',
	'P',
	'X',
	'W',
	'Z'
] as const
export const BUILDINGS_ND = ['BN', 'CN'] as const
export const BUILDINGS = [...BUILDINGS_IN, ...BUILDINGS_ND]
export const ROOMS_ALL = 'Alle'
export const DURATION_PRESET = '01:00'
export const ROOM_SEARCH_DURATIONS = [
	'00:15',
	'00:30',
	'00:45',
	'01:00',
	'01:30',
	'02:00',
	'02:30',
	'03:00',
	'03:30',
	'04:00',
	'04:30',
	'05:00',
	'05:30',
	'06:00'
] as const
export const SUGGESTION_DURATION_PRESET = 90
export const FLOOR_ORDER = ['4', '3', '2', '1.5', '1', 'EG', '-1'] as const
export const FLOOR_SUBSTITUTES: Record<string, string> = {
	0: 'EG',
	0.5: '1.5',
	1: '1',
	2: '2',
	3: '3',
	4: '4'
}

export function getFloorLevel(floor: string): number {
	if (floor === 'EG') {
		return 0
	}
	const parsed = Number.parseFloat(floor.replace(',', '.'))
	return Number.isFinite(parsed) ? parsed : Number.NaN
}

/** +1 going to a higher floor, -1 going lower, 0 if the levels match or are unknown. */
export function getFloorSlideDirection(
	fromFloor: string,
	toFloor: string
): number {
	const from = getFloorLevel(fromFloor)
	const to = getFloorLevel(toFloor)
	if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) {
		return 0
	}
	return to > from ? 1 : -1
}

export function sortFloors(floors: string[]): string[] {
	return [...floors].sort((a, b) => {
		const aIndex = FLOOR_ORDER.indexOf(a as (typeof FLOOR_ORDER)[number])
		const bIndex = FLOOR_ORDER.indexOf(b as (typeof FLOOR_ORDER)[number])
		const aSortIndex = aIndex === -1 ? FLOOR_ORDER.length : aIndex
		const bSortIndex = bIndex === -1 ? FLOOR_ORDER.length : bIndex

		return aSortIndex === bSortIndex
			? a.localeCompare(b)
			: aSortIndex - bSortIndex
	})
}

export function getBuildingCodes(values: unknown[]): string[] {
	return Array.from(
		new Set(
			values.filter(
				(value): value is string =>
					typeof value === 'string' && value.length > 0
			)
		)
	).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}
