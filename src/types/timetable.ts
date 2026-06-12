import type { CampusLifeEvent } from './campus-life'
import type { Calendar } from './data'
import type { Exam, FriendlyTimetableEntry } from './utils'

export interface ITimetableViewProps {
	timetable: FriendlyTimetableEntry[]
	exams: Exam[]
	calendarEvents: Calendar[],
	campusLifeEvents: CampusLifeEvent[]
}
export type CalendarMode = '3days' | 'list'
