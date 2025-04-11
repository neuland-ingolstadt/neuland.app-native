import type {
	Exams,
	Grade,
	Lecturers,
	PersData,
	Rooms,
	ThiNews,
	TimetableResponse
} from '@/types/thi-api'

import { toast } from 'burnt'
import { APIError, AnonymousAPIClient } from './anonymous-api'
import { callWithSession } from './thi-session-handler'

export interface PersonalData {
	persdata?: {
		stg?: string
		po_url?: string
	}
}

/**
 * Client for accessing the API as a particular user.
 *
 * @see {@link https://github.com/neuland-ingolstadt/neuland.app/blob/develop/docs/thi-rest-api.md}
 */
export class AuthenticatedAPIClient extends AnonymousAPIClient {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async requestAuthenticated(params: object): Promise<any> {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return this.sessionHandler(async (session: any) => {
			const res = await this.request({
				session,
				...params
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
			format: 'json'
		})

		return res
	}

	/**
	 * Fetches the timetable for a specific date
	 * @param {Date} date Date to fetch the timetable for
	 * @param {boolean} detailed Whether to include detailed information about the lectures
	 * @returns {Promise<TimetableResponse>} Promise that resolves with the timetable
	 */
	async getTimetable(date: Date, detailed = false): Promise<TimetableResponse> {
		try {
			const res = await this.requestAuthenticated({
				service: 'thiapp',
				method: 'stpl',
				format: 'json',
				day: date.getDate(),
				month: date.getMonth() + 1,
				year: date.getFullYear(),
				details: detailed ? 1 : 0
			})

			return {
				semester: res[0],
				holidays: res[1],
				timetable: res[2]
			}
			// biome-ignore lint/suspicious/noExplicitAny: e is any
		} catch (e: any) {
			// when the user did not select any classes, the timetable returns 'Query not possible'
			if (e.data === 'Query not possible') {
				return {
					timetable: [],
					holidays: [],
					semester: []
				}
			}
			// If the error indicates malformed JSON and we requested detailed info, try again with details = 0
			if (e.message?.includes('API returned malformed JSON:') && detailed) {
				const timetable = await this.getTimetable(date, false)
				toast({
					message: 'Lecture details unavailable',
					title: 'THI API Error',
					preset: 'error',
					haptic: 'warning'
				})
				return timetable
			}
			throw e
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
				modus: '1' // what does this mean? if only we knew
			})

			if (!Array.isArray(res)) {
				throw new Error('Response is not an array')
			}

			return res
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (e: any) {
			// when you have no exams the API sometimes returns "No exam data available"
			if (
				e.data === 'No exam data available' ||
				e.data === 'Query not possible'
			) {
				return []
			}
			throw e
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
			format: 'json'
		})

		return res
	}

	/**
	 * Fetches the free rooms for a specific date
	 * @param {Date} date Date to fetch the room availability for
	 */
	async getFreeRooms(date: Date): Promise<Rooms[]> {
		const res = await this.requestAuthenticated({
			service: 'thiapp',
			method: 'rooms',
			format: 'json',
			day: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		})
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
			format: 'json'
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
			to
		})

		return res
	}

	/**
	 * Fetches the latest thi news
	 * @returns {Promise<ThiNews[]>} Promise that resolves with the news
	 */
	async getThiNews(): Promise<ThiNews[]> {
		const res = await this.requestAuthenticated({
			service: 'thiapp',
			method: 'thinews',
			format: 'json'
		})

		return res
	}
}

export default new AuthenticatedAPIClient()
