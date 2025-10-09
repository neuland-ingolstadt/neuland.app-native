import { trackEvent } from '@aptabase/react-native'
import type { GeoJsonProperties, Position } from 'geojson'
import { Platform, Share } from 'react-native'
import { SEARCH_TYPES } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import type { Rooms, TypeStunde } from '@/types/thi-api'
import type { AvailableRoom } from '@/types/utils'
import { formatISODate } from './date-utils'
import { copyToClipboard } from './ui-utils'

const IGNORE_GAPS = 15

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
]
export const INGOLSTADT_CENTER = [11.4328, 48.7663]
export const NEUBURG_CENTER = [11.17261, 48.732]
export const BUILDINGS_ND = ['BN', 'CN']
export const BUILDINGS = [...BUILDINGS_IN, ...BUILDINGS_ND]
export const BUILDINGS_ALL = 'Alle'
export const ROOMS_ALL = 'Alle'
export const DURATION_PRESET = '01:00'
export const SUGGESTION_DURATION_PRESET = 90
export const FLOOR_ORDER = ['4', '3', '2', '1.5', '1', 'EG', '-1']
export const FLOOR_SUBSTITUTES: Record<string, string> = {
	0: 'EG',
	0.5: '1.5',
	1: '1',
	2: '2',
	3: '3',
	4: '4'
}

/**
 * Adds minutes to a date object.
 * @param {Date} date
 * @param {number} minutes
 * @returns {Date}
 */
export function addMinutes(date: Date, minutes: number): Date {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		Number(date.getMinutes()) + minutes,
		date.getSeconds(),
		date.getMilliseconds()
	)
}

/**
 * Returns the earlier of two dates.
 * @param {Date} a
 * @param {Date} b
 * @returns {Date}
 */
function minDate(a: Date, b: Date): Date {
	return a < b ? a : b
}

/**
 * Returns the later of two dates.
 * @param {Date} a
 * @param {Date} b
 * @returns {Date}
 */
function maxDate(a: Date, b: Date): Date {
	return a > b ? a : b
}

/**
 * Checks whether a room is in a certain building.
 * @param {string} room Room name (e.g. `G215`)
 * @param {string} building Building name (e.g. `G`)
 * @returns {boolean}
 */
function isInBuilding(room: string, building: string): boolean {
	return new RegExp(`${building}\\d+`, 'i').test(room)
}

/**
 * Converts the room plan for easier processing.
 * @param rooms rooms array as described in thi-rest-api.md
 * @param {Date} date Date to filter for
 * @returns {object}
 */
export type RoomOpenings = Record<
	string,
	{
		type: string
		from: Date
		until: Date
		capacity: number
	}[]
>

/**
 * Returns a map of room openings for a given date.
 * @param rooms An array of rooms.
 * @param date The date to get room openings for.
 * @returns A map of room openings.
 */
export function getRoomOpenings(rooms: Rooms[], date: Date): RoomOpenings {
	const isoDate = formatISODate(date)
	const openings: RoomOpenings = {}
	// get todays rooms
	rooms
		.filter((room) => room.datum.startsWith(isoDate))
		// flatten room types
		.flatMap((room) => room.rtypes)
		// flatten time slots
		.flatMap((rtype) =>
			Object.values(rtype.stunden).map((stunde) => ({
				...stunde,
				type: rtype.raumtyp
			}))
		)
		// flatten room list
		.flatMap((stunde: TypeStunde) =>
			stunde.raeume.map(
				([, , room, capacity]: [string, string, number, number]) => ({
					// 0 indicates that every room is free
					room: room === 0 ? ROOMS_ALL : room.toString(),
					type: stunde.type.replace(/ \(.*\)$/, '').trim(),
					from: new Date(stunde.von),
					until: new Date(stunde.bis),
					capacity
				})
			)
		)
		.forEach(
			({
				room,
				type,
				from,
				until,
				capacity
			}: {
				room: string
				type: string
				from: Date
				until: Date
				capacity: number
			}) => {
				// initialize room
				// biome-ignore lint/suspicious/noAssignInExpressions: TODO
				const roomOpenings = openings[room] ?? (openings[room] = [])
				// find overlapping opening
				// ignore gaps of up to IGNORE_GAPS minutes since the time slots don't line up perfectly
				const opening = roomOpenings.find(
					(opening) =>
						from <= addMinutes(opening.until, IGNORE_GAPS) &&
						until >= addMinutes(opening.from, -IGNORE_GAPS)
				)
				if (opening != null) {
					// extend existing opening
					opening.from = minDate(from, opening.from)
					opening.until = maxDate(until, opening.until)
				} else {
					// create new opening
					roomOpenings.push({ type, from, until, capacity })
				}
			}
		)
	return openings
}

/**
 * Get a suitable preset for the time selector.
 * If outside the opening hours, this will skip to the time the university opens.
 * @returns {Date}
 */

export function getNextValidDate(): { startDate: Date; wasModified: boolean } {
	const startDate = new Date()
	let wasModified = false // Track if startDate is modified

	if (startDate.getDay() === 6 && startDate.getHours() > 20) {
		startDate.setDate(startDate.getDate() + 2)
		startDate.setHours(8)
		startDate.setMinutes(15)
		wasModified = true // Date was modified
	} else if (startDate.getDay() === 0 || startDate.getHours() > 20) {
		// Sunday or after 8pm
		startDate.setDate(startDate.getDate() + 1)
		startDate.setHours(8)
		startDate.setMinutes(15)
		wasModified = true // Date was modified
	} else if (startDate.getHours() < 8) {
		// Before 8am
		startDate.setHours(8)
		startDate.setMinutes(15)
		wasModified = true // Date was modified
	}

	return { startDate, wasModified }
}
/**
 * Filters suitable room openings.
 * @param {object[]} data Room data
 * @param {string} date Start date as an ISO string
 * @param {string} time Start time
 * @param {string} [building] Building name
 * @param {string} [duration] Minimum opening duration
 * @returns {Promise<object[]>}
 */
export function filterRooms(
	data: Rooms[],
	date: string,
	time: string,
	building: string = BUILDINGS_ALL,
	duration: string = DURATION_PRESET
): AvailableRoom[] {
	const beginDate = new Date(`${date}T${time}`)
	const [durationHours, durationMinutes] = duration
		.split(':')
		.map((x) => Number.parseInt(x, 10))
	const endDate = new Date(
		beginDate.getFullYear(),
		beginDate.getMonth(),
		beginDate.getDate(),
		beginDate.getHours() + durationHours,
		beginDate.getMinutes() + durationMinutes,
		beginDate.getSeconds(),
		beginDate.getMilliseconds()
	)
	return searchRooms(data, beginDate, endDate, building)
}

/**
 * Filters suitable room openings.
 * @param {Date} beginDate Start date as Date object
 * @param {Date} endDate End date as Date object
 * @param {string} [building] Building name (e.g. `G`), defaults to all buildings
 * @returns {Promise<object[]>}
 */
export function searchRooms(
	data: Rooms[],
	beginDate: Date,
	endDate: Date,
	building: string = BUILDINGS_ALL
): AvailableRoom[] {
	const openings = getRoomOpenings(data, beginDate)
	return Object.keys(openings)
		.flatMap((room) =>
			openings[room].map((opening) => ({
				room,
				type: opening.type,
				from: opening.from,
				until: opening.until,
				capacity: opening.capacity
			}))
		)
		.filter(
			(opening) =>
				(building === BUILDINGS_ALL ||
					isInBuilding(opening.room.toLowerCase(), building)) &&
				beginDate >= opening.from &&
				endDate <= opening.until
		)
		.sort((a, b) => a.room.localeCompare(b.room))
}

/**
 * Filters suitable room openings.
 * @param rooms Room data
 * @returns {object[]}
 */
export function getCenter(rooms: Position[][][]): Position {
	const getCenterPoint = (points: Position[][]): Position[] => {
		const x = points[0].map((point: Position) => point[0])
		const y = points[0].map((point: Position) => point[1])
		const minX = Math.min(...x)
		const maxX = Math.max(...x)
		const minY = Math.min(...y)
		const maxY = Math.max(...y)
		return [(minX + maxX) / 2, (minY + maxY) / 2] as unknown as Position[]
	}

	const centerPoints = rooms.reduce(
		(acc, room) => {
			const centerPoint = getCenterPoint(room) as unknown as number[]
			acc.lon += centerPoint[0]
			acc.lat += centerPoint[1]
			acc.count += 1
			return acc
		},
		{ lon: 0, lat: 0, count: 0 }
	)

	return [
		centerPoints.lon / centerPoints.count,
		centerPoints.lat / centerPoints.count
	]
}

/**
 * Filters suitable room openings.
 * @param coordinates  oom data
 * @returns Position
 */
export function getCenterSingle(
	coordinates: number[][][] | undefined
): number[] {
	if (coordinates == null || coordinates.length === 0) {
		return INGOLSTADT_CENTER
	}
	const centerPoints = coordinates[0].reduce(
		(acc, coordinate) => {
			acc.lon += coordinate[0]
			acc.lat += coordinate[1]
			acc.count += 1
			return acc
		},
		{ lon: 0, lat: 0, count: 0 }
	)

	return [
		centerPoints.lon / centerPoints.count,
		centerPoints.lat / centerPoints.count
	]
}

/**
 * Opens the share modal with the room link.
 * @param room Room name
 */
export const handleShareModal = (room: string): void => {
	const payload = `https://web.neuland.app/map/?room=${room}`
	trackEvent('Share', {
		type: 'room'
	})
	if (Platform.OS === 'web') {
		void copyToClipboard(payload)
		return
	}

	void Share.share(
		Platform.OS === 'android' ? { message: payload } : { url: payload }
	)
}

export const getIcon = (
	type: SEARCH_TYPES,
	properties?: { result: { item: { properties: GeoJsonProperties } } }
): { ios: string; android: MaterialIcon } => {
	const funktionEn = properties?.result?.item?.properties?.Funktion_en || ''
	const raum = properties?.result?.item?.properties?.Raum || ''
	const food = ['M001', 'X001', 'F001']
	switch (type) {
		case SEARCH_TYPES.BUILDING:
			return { ios: 'building', android: 'corporate_fare' }
		case SEARCH_TYPES.ROOM:
			if (funktionEn.length > 0) {
				if (funktionEn.includes('PC')) {
					return { ios: 'pc', android: 'keyboard' }
				}
				if (funktionEn.includes('Lab')) {
					return { ios: 'flask', android: 'science' }
				}
				if (food.includes(raum)) {
					return { ios: 'fork.knife', android: 'local_cafe' }
				}
				if (funktionEn.includes('Office')) {
					return { ios: 'lamp.desk', android: 'business_center' }
				}
				if (funktionEn.includes('Toilet')) {
					return { ios: 'toilet', android: 'wc' }
				}
				if (funktionEn.includes('Lecture') || funktionEn.includes('Seminar')) {
					return { ios: 'studentdesk', android: 'school' }
				}
				if (funktionEn.includes('Corridor')) {
					return {
						ios: 'arrow.triangle.turn.up.right.diamond',
						android: 'directions'
					}
				}
			}
			return { ios: 'mappin', android: 'location_on' }
		default:
			return { ios: 'mappin', android: 'location_on' }
	}
}
