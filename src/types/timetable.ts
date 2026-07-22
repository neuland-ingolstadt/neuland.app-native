import type { Exam, FriendlyTimetableEntry } from './utils'

export interface ITimetableViewProps {
	timetable: FriendlyTimetableEntry[]
	exams: Exam[]
}
export type CalendarMode = '3days' | 'list'

export type CalendarEntry = {
	id: string
	date: Date
	startDate: Date
	endDate: Date | null
	name:
		| {
				en?: string
				de?: string
				[key: string]: string | undefined
		  }
		| string
	isAllDay: boolean
	eventType: 'calendar'
	originalStartDate?: Date
	originalEndDate?: Date | null
}
