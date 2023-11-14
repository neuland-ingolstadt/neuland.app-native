import API from '@/api/authenticated-api'
import { type Rooms } from '@customTypes/thi-api'

import { formatISODate } from './date-utils'

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
    'W',
    'Z',
]
export const BUILDINGS_ND = ['BN', 'CN']
export const BUILDINGS = [...BUILDINGS_IN, ...BUILDINGS_ND]
export const BUILDINGS_ALL = 'Alle'
export const ROOMS_ALL = 'Alle'
export const DURATION_PRESET = '01:00'
export const SUGGESTION_DURATION_PRESET = 90

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
type RoomOpenings = Record<
    string,
    Array<{
        type: string
        from: Date
        until: Date
    }>
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
                type: rtype.raumtyp,
                ...stunde,
            }))
        )
        // flatten room list
        .flatMap((stunde: any) =>
            stunde.raeume.map(([, , room]: [string, string, number]) => ({
                // 0 indicates that every room is free
                room: room === 0 ? ROOMS_ALL : room.toString(),
                type: stunde.type,
                from: new Date(stunde.von),
                until: new Date(stunde.bis),
            }))
        )
        // iterate over every room
        .forEach(({ room, type, from, until }) => {
            // initialize room
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
                roomOpenings.push({ type, from, until })
            }
        })
    return openings
}

/**
 * Get a suitable preset for the time selector.
 * If outside the opening hours, this will skip to the time the university opens.
 * @returns {Date}
 */
export function getNextValidDate(): Date {
    const startDate = new Date()

    if (startDate.getDay() === 6 && startDate.getHours() > 20) {
        startDate.setDate(startDate.getDate() + 2)
        startDate.setHours(8)
        startDate.setMinutes(15)
    } else if (startDate.getDay() === 0 || startDate.getHours() > 20) {
        // sunday or after 9pm
        startDate.setDate(startDate.getDate() + 1)
        startDate.setHours(8)
        startDate.setMinutes(15)
    } else if (startDate.getHours() < 8) {
        // before 6am
        startDate.setHours(8)
        startDate.setMinutes(15)
    }

    return startDate
}
export interface AvailableRoom {
    from: Date
    until: Date
    room: string
    type: string
}

export interface RoomEntry {
    coordinates: number[][]
    options?: string[] | object
    properties: Properties
}

interface Properties {
    Ebene: string
    Etage: string
    Funktion_de: string
    Funktion_en: string
    Gebaeude: string
    Raum: string
    Standort: string
}

/**
 * Filters suitable room openings.
 * @param {string} date Start date as an ISO string
 * @param {string} time Start time
 * @param {string} [building] Building name
 * @param {string} [duration] Minimum opening duration
 * @returns {Promise<object[]>}
 */
export async function filterRooms(
    date: string,
    time: string,
    building: string = BUILDINGS_ALL,
    duration: string = DURATION_PRESET
): Promise<AvailableRoom[]> {
    const beginDate = new Date(date + 'T' + time)

    const [durationHours, durationMinutes] = duration
        .split(':')
        .map((x) => parseInt(x, 10))
    const endDate = new Date(
        beginDate.getFullYear(),
        beginDate.getMonth(),
        beginDate.getDate(),
        beginDate.getHours() + durationHours,
        beginDate.getMinutes() + durationMinutes,
        beginDate.getSeconds(),
        beginDate.getMilliseconds()
    )

    return await searchRooms(beginDate, endDate, building)
}

/**
 * Filters suitable room openings.
 * @param {Date} beginDate Start date as Date object
 * @param {Date} endDate End date as Date object
 * @param {string} [building] Building name (e.g. `G`), defaults to all buildings
 * @returns {Promise<object[]>}
 */
export async function searchRooms(
    beginDate: Date,
    endDate: Date,
    building: string = BUILDINGS_ALL
): Promise<AvailableRoom[]> {
    const data = await API.getFreeRooms(beginDate)
    const openings = getRoomOpenings(data, beginDate)
    return Object.keys(openings)
        .flatMap((room) =>
            openings[room].map((opening) => ({
                room,
                type: opening.type,
                from: opening.from,
                until: opening.until,
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
