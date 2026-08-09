import type { Rooms, TypeStunde } from '@/types/thi-api'
import type { AvailableRoom } from '@/types/utils'
import { formatISODate } from './date-utils'
import { BUILDINGS_ALL, DURATION_PRESET, ROOMS_ALL } from './map-constants'

const IGNORE_GAPS = 15

export type RoomOpenings = Record<
	string,
	{
		type: string
		from: Date
		until: Date
		capacity: number
	}[]
>

function minDate(a: Date, b: Date): Date {
	return a < b ? a : b
}

function maxDate(a: Date, b: Date): Date {
	return a > b ? a : b
}

function isInBuilding(room: string, building: string): boolean {
	return new RegExp(`${building}\\d+`, 'i').test(room)
}

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

export function getRoomOpenings(rooms: Rooms[], date: Date): RoomOpenings {
	const isoDate = formatISODate(date)
	const openings: RoomOpenings = {}
	rooms
		.filter((room) => room.datum.startsWith(isoDate))
		.flatMap((room) => room.rtypes)
		.flatMap((rtype) =>
			Object.values(rtype.stunden).map((stunde) => ({
				...stunde,
				type: rtype.raumtyp
			}))
		)
		.flatMap((stunde: TypeStunde) =>
			stunde.raeume.map(
				([, , room, capacity]: [string, string, number, number]) => ({
					room: room === 0 ? ROOMS_ALL : room.toString(),
					type: stunde.type.replace(/ \(.*\)$/, '').trim(),
					from: new Date(stunde.von),
					until: new Date(stunde.bis),
					capacity
				})
			)
		)
		.forEach(({ room, type, from, until, capacity }) => {
			let roomOpenings = openings[room]
			if (roomOpenings == null) {
				roomOpenings = []
				openings[room] = roomOpenings
			}
			const opening = roomOpenings.find(
				(existingOpening) =>
					from <= addMinutes(existingOpening.until, IGNORE_GAPS) &&
					until >= addMinutes(existingOpening.from, -IGNORE_GAPS)
			)
			if (opening != null) {
				opening.from = minDate(from, opening.from)
				opening.until = maxDate(until, opening.until)
			} else {
				roomOpenings.push({ type, from, until, capacity })
			}
		})
	return openings
}

export function getNextValidDate(): { startDate: Date; wasModified: boolean } {
	const startDate = new Date()
	let wasModified = false

	if (startDate.getDay() === 6 && startDate.getHours() > 20) {
		startDate.setDate(startDate.getDate() + 2)
		startDate.setHours(8)
		startDate.setMinutes(15)
		wasModified = true
	} else if (startDate.getDay() === 0 || startDate.getHours() > 20) {
		startDate.setDate(startDate.getDate() + 1)
		startDate.setHours(8)
		startDate.setMinutes(15)
		wasModified = true
	} else if (startDate.getHours() < 8) {
		startDate.setHours(8)
		startDate.setMinutes(15)
		wasModified = true
	}

	return { startDate, wasModified }
}

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
