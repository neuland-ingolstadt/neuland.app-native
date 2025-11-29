import type { CampusLifeEvent } from './campus-life'
import type { Exam, FriendlyTimetableEntry } from './utils'

export interface ITimetableViewProps {
	timetable: FriendlyTimetableEntry[]
	exams: Exam[]
	campusLifeEvents: CampusLifeEvent[]
}
export type CalendarMode = '3days' | 'list'
