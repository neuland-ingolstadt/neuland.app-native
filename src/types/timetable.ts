import { type Exam, type FriendlyTimetableEntry } from './utils'

export interface ITimetableViewProps {
    timetable: FriendlyTimetableEntry[]
    exams: Exam[]
}
export type CalendarMode = '3days' | 'list'
