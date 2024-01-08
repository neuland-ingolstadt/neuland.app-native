import API from '@/api/authenticated-api'
import { type LectureData } from '@/hooks/contexts/notifications'
import {
    type CalendarEvent,
    type FriendlyTimetableEntry,
    type TimetableSections,
} from '@/types/utils'
import { scheduleNotificationAsync } from 'expo-notifications'
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

    rawTimetable.push(...rawTimetableNextMonth)
    return rawTimetable
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

/**
 * Schedules a notification for a lecture.
 * @param lectureTitle Title of the lecture
 * @param room Room of the lecture
 * @param minsBefore Minutes before the lecture to send the notification
 * @param date Date of the lecture
 * @param t Translation function
 * @returns Promise with the id of the scheduled notification
 */
export async function scheduleLectureNotification(
    lectureTitle: string,
    room: string,
    minsBefore: number,
    date: Date,
    t: any
): Promise<LectureData[]> {
    const alertDate = new Date(date.getTime() - minsBefore * 60000)
    const id = await scheduleNotificationAsync({
        content: {
            title: lectureTitle,
            body: `${t('notificatons.body', {
                mins: minsBefore,
                room,
            })}`,
        },
        trigger: alertDate,
    })
    return [{ startDateTime: date, room, id }]
}

/**
 * Shows an alert to the user that they need to enable notifications.
 * @param t Translation function
 * @returns void
 */
export function notificationAlert(t: any): void {
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
