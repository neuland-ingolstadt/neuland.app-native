import moment from 'moment'
import type { CampusLifeEvent } from '@/types/campus-life'
import type { Calendar } from '@/types/data'
import type {
	CalendarEvent,
	Exam,
	FriendlyTimetableEntry,
	TimetableSections
} from '@/types/utils'

import API from '../api/authenticated-api'
import { combineDateTime } from './date-utils'

/**
 * Retrieves the users timetable for a given date and returns it in a friendly format.
 * @param date Date to get the timetable for
 * @param detailed Whether to include detailed information about the lectures
 * @returns
 */
export async function getFriendlyTimetable(
	date: Date,
	detailed = false
): Promise<FriendlyTimetableEntry[]> {
	// if month is august or september, there are no lectures. Adjust the date to october
	if (date.getMonth() === 7 || date.getMonth() === 8) {
		date.setMonth(9)
	}
	const [rawTimetableResponse, rawTimetableNextMonthResponse] =
		await Promise.all([
			API.getTimetable(date, detailed),
			API.getTimetable(
				new Date(date.getFullYear(), date.getMonth() + 1),
				detailed
			)
		])

	const rawTimetable = rawTimetableResponse.timetable
	const rawTimetableNextMonth = rawTimetableNextMonthResponse.timetable
	// the reduce is need to merge the two timetables with potentially overlapping dates
	const mergedTimetable = [...rawTimetable, ...rawTimetableNextMonth].reduce<
		typeof rawTimetable
	>((acc, curr) => {
		if (curr == null) return acc

		const existingIndex = acc.findIndex(
			(item) => item != null && item.date === curr.date
		)

		if (existingIndex > -1) {
			acc[existingIndex].hours = {
				...acc[existingIndex].hours,
				...curr.hours
			}
		} else {
			acc.push(curr)
		}

		return acc
	}, [])
	return mergedTimetable
		.filter((day) => day !== null)
		.flatMap((day) =>
			Object.values(day.hours).flatMap((hours) =>
				hours.map((hour) => ({
					...hour,
					date: day.date
				}))
			)
		)
		.map((lecture) => {
			const startDate = combineDateTime(lecture.date, lecture.von)
			const endDate = combineDateTime(lecture.date, lecture.bis)

			let rooms = [] as string[]
			if (lecture.details.raum !== '' && lecture.details.raum !== null) {
				rooms = lecture.details.raum
					.split(', ')
					.map((room) => room.trim().toUpperCase())
					.sort()
			}

			return {
				date: lecture.date,
				startDate,
				endDate,
				name: lecture.details.fach,
				shortName: lecture.details.veranstaltung.split(' - ')[0],
				rooms: rooms.filter((room) => room !== ''),
				lecturer: lecture.details.dozent,
				exam: lecture.details.pruefung,
				course: lecture.details.stg,
				studyGroup: lecture.details.stgru,
				sws: lecture.details.sws,
				ects: lecture.details.ectspoints,
				goal: lecture.details.ziel,
				contents: lecture.details.inhalt,
				literature: lecture.details.literatur
			}
		})
}

/**
 * Groups the given timetable by date.
 * @param timetable Timetable to group
 * @returns Timetable grouped by date
 **/

export function getGroupedTimetable(
	timetable: FriendlyTimetableEntry[],
	exams: Exam[],
	includeCalendar = false,
	calendarEvents: Calendar[] = [],
	includeCampusLife = false,
	campusLifeEvents: CampusLifeEvent[] = []
): TimetableSections[] {
	const combinedData = [
		...timetable.map((lecture) => ({ ...lecture, eventType: 'timetable' })),
		...exams.map((exam) => {
			const duration = Number(exam?.type?.match(/\d+/)?.[0] ?? 90)
			return {
				...exam,
				endDate: moment(exam.date).add(duration, 'minutes').toDate(),
				eventType: 'exam'
			}
		})
	]

	if (includeCalendar && calendarEvents.length > 0) {
		const processedCalendarEvents = calendarEvents.map((event) => {
			const originalStartDate = new Date(event.begin)
			const originalEndDate = event.end ? new Date(event.end) : null

			const startDate = new Date(event.begin)

			let endDate: Date
			if (event.end) {
				endDate = new Date(event.end)
			} else {
				endDate = new Date(startDate)
				if (event.hasHours) {
					endDate.setHours(endDate.getHours() + 2)
				}
			}

			const isAllDay = event.hasHours !== true

			if (isAllDay && originalEndDate) {
				const eventDays = []
				const currentDate = new Date(startDate)
				currentDate.setHours(0, 0, 0, 0)

				while (currentDate <= endDate) {
					eventDays.push({
						id: event.id,
						date: new Date(currentDate),
						startDate: new Date(currentDate),
						endDate: null,
						originalStartDate,
						originalEndDate,
						name: event.name,
						isAllDay: true,
						eventType: 'calendar'
					})

					currentDate.setDate(currentDate.getDate() + 1)
				}
				return eventDays
			}
			return [
				{
					date: startDate,
					startDate,
					endDate: isAllDay ? null : endDate,
					originalStartDate,
					originalEndDate,
					name: event.name,
					isAllDay,
					eventType: 'calendar'
				}
			]
		})

		const flattenedCalendarEvents = processedCalendarEvents.flat()
		// biome-ignore lint/suspicious/noExplicitAny: TODO
		combinedData.push(...(flattenedCalendarEvents as any))
	}

	if (includeCampusLife && campusLifeEvents.length > 0) {
		const processedCampusLifeEvents = campusLifeEvents.map((event) => {
			const startDate = new Date(event.startDateTime)
			const endDate = new Date(event.endDateTime)

			return {
				id: event.id,
				date: startDate,
				startDate,
				endDate,
				name: event.titles,
				location: event.location,
				host: event.host,
				isAllDay: false,
				eventType: 'campuslife'
			}
		})

		// biome-ignore lint/suspicious/noExplicitAny: TODO
		combinedData.push(...(processedCampusLifeEvents as any))
	}

	// Sort combinedData by date
	combinedData.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	)

	const dates = [
		...new Set(
			combinedData.map(
				(item) => new Date(item.date).toISOString().split('T')[0]
			)
		)
	]

	const groups = dates.map((date) => ({
		title: new Date(date),
		data: combinedData.filter(
			(item) => new Date(item.date).toISOString().split('T')[0] === date
		)
	}))

	return groups as TimetableSections[]
}

export function convertTimetableToWeekViewEvents(
	entries: FriendlyTimetableEntry[],
	color: string,
	textColor: string
): CalendarEvent[] {
	return entries.map((entry) => {
		return {
			start: entry.startDate,
			end: entry.endDate,
			title: entry.shortName,
			color,
			textColor,
			location: entry.rooms?.[0],
			entry
		}
	})
}

/**
 * Generate a key for a lecture to be used for the notification hashmap
 * @param lectureName
 * @param startDate
 * @param room
 * @returns {string}
 */
export function generateKey(
	lectureName: string,
	startDate: Date | string,
	room: string
): string {
	return `${lectureName}-${new Date(startDate).getTime().toString()}-${room}`
}

// This function checks if a given room string is valid based on the following criteria:
// - The room string must start with 1 or 2 alphabetic characters (A-Z or a-z).
// - Followed by 3 numeric digits (0-9).
// - Optionally, it can have a 'U' in place of the first digit for basement rooms.
export const isValidRoom = (room: string): boolean => {
	return /^[A-Za-z]{1,2}U?\d{2,3}$/.test(room)
}

/**
 * Load the timetable
 * @returns
 */
export const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
	const timetable = await getFriendlyTimetable(new Date(), true)
	if (timetable.length === 0) {
		throw new Error('Timetable is empty')
	}
	return timetable
}
