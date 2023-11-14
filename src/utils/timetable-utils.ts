import API from '@/api/authenticated-api'
import { type FriendlyTimetableEntry } from '@/types/utils'

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
