import API from '@/api/authenticated-api'
import rawCalendar from '@/data/calendar.json'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar } from '@/types/data'
import type { CalendarEvent, Exam } from '@/types/utils'
import type { i18n } from 'i18next'

import { ignoreTime } from './date-utils'

export const compileTime = new Date()
export const calendar: Calendar[] = rawCalendar
    .map((x: unknown) => {
        const event: Calendar = {
            ...(x as Calendar),
            begin: new Date((x as Calendar).begin),
            end:
                (x as Calendar).end != null
                    ? new Date((x as Calendar).end as unknown as string)
                    : undefined,
        }

        return event
    })
    .filter(
        (x) => (x.end != null && x.end > compileTime) || x.begin > compileTime
    )
    .sort((a, b) => (a.end?.getTime() ?? 0) - (b.end?.getTime() ?? 0))
    .sort((a, b) => a.begin.getTime() - b.begin.getTime())

/**
 * Fetches and parses the exam list
 * @returns {object[]}
 */
export async function loadExamList(): Promise<Exam[]> {
    const examList = await API.getExams()
    if (examList.length === 0) {
        return []
    }
    return (
        examList
            // Modus 2 seems to be an indicator for "not real" exams like internships, which still got listed in API.getExams()
            .filter((x) => x.modus !== '2')
            .map((exam) => ({
                name: exam.titel,
                type: exam.pruefungs_art,
                rooms: exam.exam_rooms,
                seat: exam.exam_seat,
                notes: exam.anmerkung,
                examiners: exam.pruefer_namen,
                date: new Date(exam.exam_ts),
                enrollment: new Date(exam.anm_ts),
                aids:
                    exam.hilfsmittel?.filter((v, i, a) => a.indexOf(v) === i) ??
                    [],
            }))
            // sort list in chronologically order
            .sort((a, b) => a.date.getTime() - b.date.getTime())
    )
}

export function convertCalendarToWeekViewEvents(
    entries: Calendar[],
    i18n: i18n,
    color: string,
    textColor: string
): CalendarEvent[] {
    return entries.map((entry) => {
        const allDay = entry.hasHours === false || !entry.hasHours
        const endDate = entry.end ?? entry.begin

        return {
            start: allDay ? ignoreTime(entry.begin) : entry.begin,
            end: allDay ? ignoreTime(endDate) : endDate,
            title: entry?.name[i18n.language as LanguageKey],
            color,
            textColor,
        }
    })
}
