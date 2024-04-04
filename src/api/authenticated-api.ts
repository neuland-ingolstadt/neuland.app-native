/* eslint-disable @typescript-eslint/no-unsafe-argument */
import courseShortNames from '@/data/course-short-names.json'
import { type CourseShortNames } from '@/types/data'
import {
    type AvailableLibrarySeats,
    type Exams,
    type Grade,
    type Lecturers,
    type PersData,
    type Reservation,
    type Rooms,
    type ThiNews,
    type TimetableResponse,
} from '@/types/thi-api'

import { APIError, AnonymousAPIClient } from './anonymous-api'
import { callWithSession } from './thi-session-handler'

export interface PersonalData {
    persdata?: {
        stg?: string
        po_url?: string
    }
}

/**
 * Determines the users faculty.
 * @param {PersonalData} data Personal data
 * @returns {string} Faculty name (e.g. `Informatik`)
 */
function extractFacultyFromPersonalData(data: PersonalData): string | null {
    if (data?.persdata?.stg == null) {
        return null
    }
    const shortNames: CourseShortNames = courseShortNames
    const shortName = data.persdata.stg
    const faculty = Object.keys(shortNames).find((faculty) =>
        (courseShortNames as Record<string, string[]>)[faculty].includes(
            shortName
        )
    )

    return faculty ?? null
}

/**
 * Determines the users SPO version.
 * @param {PersonalData} data Personal data
 * @returns {string}
 */
function extractSpoFromPersonalData(data: PersonalData): string | null {
    if (data?.persdata?.po_url == null) {
        return null
    }

    const split = data.persdata.po_url.split('/').filter((x) => x.length > 0)
    return split[split.length - 1]
}

/**
 * Client for accessing the API as a particular user.
 *
 * @see {@link https://github.com/neuland-ingolstadt/neuland.app/blob/develop/docs/thi-rest-api.md}
 */
export class AuthenticatedAPIClient extends AnonymousAPIClient {
    private readonly sessionHandler: any

    constructor() {
        super()

        this.sessionHandler = callWithSession
    }

    /**
     * Performs an authenticated request against the API
     * @param {object} params Request data
     * @returns {object}
     */
    async requestAuthenticated(params: object): Promise<any> {
        console.log(params)
        return this.sessionHandler(async (session: any) => {
            const res = await this.request({
                session,
                ...params,
            })
            // old status format
            if (res.status !== 0) {
                throw new APIError(res.status, res.data)
            }
            // new status format
            if (res.data[0] !== 0) {
                throw new APIError(res.data[0], res.data[1])
            }

            return res.data[1]
        })
    }

    /**
     * Fetches the personal data of the user
     * @returns {Promise<object>} Promise that resolves with the personal data
     */
    async getPersonalData(): Promise<PersData> {
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'persdata',
            format: 'json',
        })

        return res
    }

    /**
     * Extracts the faculty from the personal data
     * @returns {Promise<string | null>} Promise that resolves with the faculty of the user
     */
    async getFaculty(): Promise<string | null> {
        const data = await this.getPersonalData()
        return extractFacultyFromPersonalData(data)
    }

    /**
     * Extracts the SPO version from the personal data
     * @returns {Promise<string | null>} Promise that resolves with the SPO version of the user
     */
    async getSpoName(): Promise<string | null> {
        const data = await this.getPersonalData()
        return extractSpoFromPersonalData(data)
    }

    /**
     * Extracts the full name from the personal data
     * @returns {Promise<string | null>} Promise that resolves with the full name of the user
     */
    async getFullName(): Promise<string | null> {
        const data = await this.getPersonalData()
        const fullName = data?.persdata?.vname + ' ' + data?.persdata?.name
        return fullName
    }

    /**
     * Extracts the bib number from the personal data
     * @returns {Promise<string | null>} Promise that resolves with the bib number of the user
     */
    async getLibraryNumber(): Promise<string | null> {
        const data = await this.getPersonalData()
        return data?.persdata?.bibnr
    }

    /**
     * Fetches the timetable for a specific date
     * @param {Date} date Date to fetch the timetable for
     * @param {boolean} detailed Whether to include detailed information about the lectures
     * @returns {Promise<TimetableResponse>} Promise that resolves with the timetable
     */
    async getTimetable(
        date: Date,
        detailed = false
    ): Promise<TimetableResponse> {
        try {
            const res = await this.requestAuthenticated({
                service: 'thiapp',
                method: 'stpl',
                format: 'json',
                day: date.getDate(),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                details: detailed ? 1 : 0,
            })

            return {
                semester: res[0],
                holidays: res[1],
                timetable: res[2],
            }
        } catch (e: any) {
            // when the user did not select any classes, the timetable returns 'Query not possible'
            if (e.data === 'Query not possible') {
                return {
                    timetable: [],
                    holidays: [],
                    semester: [],
                }
            } else {
                throw e
            }
        }
    }

    /**
     * Fetches the exams for the current semester
     * @returns {Promise<Exams[]>} Promise that resolves with the exams
     */
    async getExams(): Promise<Exams[]> {
        try {
            const res = await this.requestAuthenticated({
                service: 'thiapp',
                method: 'exams',
                format: 'json',
                modus: '1', // what does this mean? if only we knew
            })

            if (!Array.isArray(res)) {
                throw new Error('Response is not an array')
            }

            return res
        } catch (e: any) {
            // when you have no exams the API sometimes returns "No exam data available"
            if (
                e.data === 'No exam data available' ||
                e.data === 'Query not possible'
            ) {
                return []
            } else {
                throw e
            }
        }
    }

    /**
     * Fetches the users grades
     * @returns {Promise<Grade[]>} Promise that resolves with the grades
     */
    async getGrades(): Promise<Grade[]> {
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'grades',
            format: 'json',
        })

        return res
    }

    /**
     * Fetches the free rooms for a specific date
     * @param {Date} date Date to fetch the room availability for
     */
    async getFreeRooms(date: Date): Promise<Rooms[]> {
        console.log(date)
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'rooms',
            format: 'json',
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        })
        console.log(res)
        return res
    }

    /**
     * Fetches the lecturers for the current semester
     * @returns {Promise<Lecturers[]>} Promise that resolves with the lecturers
     */
    async getPersonalLecturers(): Promise<Lecturers[]> {
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'stpllecturers',
            format: 'json',
        })

        return res
    }

    /**
     * Fetches the lecturers for a specific range of characters
     * @param {string} from Single character indicating where to start listing the lecturers
     * @param {string} to Single character indicating where to end listing the lecturers
     */
    async getLecturers(from: string, to: string): Promise<Lecturers[]> {
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'lecturers',
            format: 'json',
            from,
            to,
        })

        return res
    }

    async getLibraryReservations(): Promise<Reservation[]> {
        try {
            const res = await this.requestAuthenticated({
                service: 'thiapp',
                method: 'reservations',
                type: 1,
                cmd: 'getreservations',
                format: 'json',
            })

            return res[1]
        } catch (e: any) {
            // as of 2021-06 the API returns "Service not available" when the user has no reservations
            // thus we dont alert the error here, but just silently set the reservations to none
            if (
                e.data === 'No reservation data' ||
                e.data === 'Service not available'
            ) {
                return []
            } else {
                throw e
            }
        }
    }

    async getAvailableLibrarySeats(): Promise<AvailableLibrarySeats[]> {
        try {
            const res = await this.requestAuthenticated({
                service: 'thiapp',
                method: 'reservations',
                type: 1,
                subtype: 1,
                cmd: 'getavailabilities',
                format: 'json',
            })

            return res[1]
        } catch (e: any) {
            // Unbekannter Fehler means the user has already reserved a spot
            // and can not reserve additional ones
            if (e.data === 'Unbekannter Fehler') {
                return []
            } else {
                throw e
            }
        }
    }

    /**
     * Adds a library reservation for a specific room, day, start and end time, and place
     * @param {string} roomId ID of the room to reserve
     * @param {string} day Date of the reservation
     * @param {string} start Start time of the reservation
     * @param {string} end End time of the reservation
     * @param {string} place Place of the reservation
     * @returns {Promise<any>} Promise that resolves with the reservation ID
     */
    async addLibraryReservation(
        roomId: string,
        day: string,
        start: string,
        end: string,
        place: string
    ): Promise<any> {
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'reservations',
            type: 1,
            subtype: 1,
            cmd: 'addreservation',
            data: JSON.stringify({
                resource: roomId,
                at: day,
                from: start,
                to: end,
                place,
            }),
            dblslots: 0,
            format: 'json',
        })

        return res[0]
    }

    /**
     * Removes a library reservation
     * @param {string} reservationId Reservation ID returned by `getLibraryReservations`
     */
    async removeLibraryReservation(reservationId: string): Promise<boolean> {
        try {
            await this.requestAuthenticated({
                service: 'thiapp',
                method: 'reservations',
                type: 1,
                subtype: 1,
                cmd: 'delreservation',
                data: reservationId,
                format: 'json',
            })

            return true
        } catch (e: any) {
            // as of 2021-06 the API returns "Service not available" when the user has no reservations
            // thus we dont alert the error here, but just silently set the reservations to none
            if (
                e.data === 'No reservation data' ||
                e.data === 'Service not available'
            ) {
                return true
            } else {
                throw e
            }
        }
    }

    /**
     * Fetches the latest thi news
     * @returns {Promise<ThiNews[]>} Promise that resolves with the news
     */
    async getThiNews(): Promise<ThiNews[]> {
        const res = await this.requestAuthenticated({
            service: 'thiapp',
            method: 'thinews',
            format: 'json',
        })

        return res
    }
}

export default new AuthenticatedAPIClient()
