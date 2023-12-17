import API from '@/api/authenticated-api'
import {
    type CalendarEvent,
    type FriendlyTimetableEntry,
    type TimetableSections,
} from '@/types/utils'

import { combineDateTime } from './date-utils'

/**
 * Retrieves the users timetable for a given date and returns it in a friendly format.
 * @param date Date to get the timetable for
 * @param detailed Whether to include detailed information about the lectures
 * @returns
 */
export async function getFriendlyTimetable(
    date: Date,
    detailed: boolean = false
): Promise<FriendlyTimetableEntry[]> {
    const rawTimetable = (await API.getTimetable(date, detailed)).timetable

    return rawTimetable
        .flatMap((day) =>
            Object.values(day.hours).flatMap((hours) =>
                hours.map((hour) => ({
                    ...hour,
                    date: day.date,
                }))
            )
        )
        .map((lecture) => {
            const startDate = combineDateTime(lecture.date, lecture.von)
            const endDate = combineDateTime(lecture.date, lecture.bis)

            let rooms = [] as string[]
            if (lecture.details.raum !== '') {
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
                rooms,
                lecturer: lecture.details.dozent,
                exam: lecture.details.pruefung,
                course: lecture.details.stg,
                studyGroup: lecture.details.stgru,
                sws: lecture.details.sws,
                ects: lecture.details.ectspoints,
                goal: lecture.details.ziel,
                contents: lecture.details.inhalt,
                literature: lecture.details.literatur,
            }
        })
}

/**
 * Groups the given timetable by date.
 * @param timetable Timetable to group
 * @returns Timetable grouped by date
 * @example
 * const timetable = [
 *    { date: '2021-01-01', name: 'Lecture 1' },
 *   { date: '2021-01-01', name: 'Lecture 2' },
 *   { date: '2021-01-02', name: 'Lecture 3' },
 * ]
 * const groupedTimetable = getGroupedTimetable(timetable)
 * // groupedTimetable = {
 * //   '2021-01-01': [
 * //     { date: '2021-01-01', name: 'Lecture 1' },
 * //     { date: '2021-01-01', name: 'Lecture 2' },
 * //   ],
 * //   '2021-01-02': [
 * //     { date: '2021-01-02', name: 'Lecture 3' },
 * //   ],
 * // }
 **/
export function getGroupedTimetable(
    timetable: FriendlyTimetableEntry[]
): TimetableSections[] {
    const dates = [...new Set(timetable.map((x) => x.date))]

    // Group lectures by date
    const groups = dates.map((date) => ({
        title: new Date(date),
        data: timetable.filter((x) => x.date === date),
    }))

    return groups
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
            location: entry.rooms.length > 0 ? entry.rooms[0] : undefined,
            entry,
        }
    })
}
