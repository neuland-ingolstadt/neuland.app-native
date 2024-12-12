import API from '@/api/authenticated-api'
import {
    type CalendarEvent,
    type Exam,
    type FriendlyTimetableEntry,
    type TimetableSections,
} from '@/types/utils'
import { type TFunction } from 'i18next'
import { Alert, Linking } from 'react-native'

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
            ),
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
                ...curr.hours,
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
                    date: day.date,
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
    timetable: FriendlyTimetableEntry[],
    exams: Exam[]
): TimetableSections[] {
    const combinedData = [
        ...timetable,
        ...exams.map((exam) => ({ ...exam, eventType: 'exam' })),
    ]
    const dates = [
        ...new Set(
            combinedData.map((item) => item.date.toString().split('T')[0])
        ),
    ]
    const groups = dates.map((date) => ({
        title: new Date(date),
        data: combinedData.filter(
            (item) => item.date.toString().split('T')[0] === date
        ),
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
            entry,
        }
    })
}

/**
 * Shows an alert to the user that they need to enable notifications.
 * @param t Translation function
 * @returns void
 */
export function notificationAlert(t: TFunction<any>): void {
    Alert.alert(
        t('notification.permission.title', { ns: 'common' }),
        t('notification.permission.description', { ns: 'common' }),
        [
            {
                text: t('misc.cancel', { ns: 'common' }),
            },
            {
                text: t('notification.permission.button', { ns: 'common' }),
                onPress: () => {
                    void Linking.openSettings()
                },
            },
        ]
    )
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
    return `${lectureName}-${new Date(startDate).getTime()}-${room}`
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
