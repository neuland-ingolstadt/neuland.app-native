import type { Lecturers } from './thi-api'

export interface Exam {
	name: string
	type: string
	rooms: string
	seat: string
	notes: string
	examiners: string[]
	date: Date
	enrollment: Date
	aids: string[]
}

export interface ExamEntry extends Exam {
	eventType: 'exam'
	endDate: Date
}

export interface FriendlyExamEvent extends Exam {
	eventType: 'exam'
	id: string
	start: {
		dateTime: Date
	}
	end: {
		dateTime: Date
	}
}

export interface FriendlyDateOptions {
	weekday?: 'short' | 'long'
	relative?: boolean
}

export interface Labels {
	[key: string]: string
	guest: string
	employee: string
	student: string
}

export interface Prices {
	[key: string]: number
	guest: number
	employee: number
	student: number
}

export interface GradeAverage {
	entries: {
		simpleName: string
		name: string
		weight: number | null
		grade: number | null
	}[]
	result: number
	resultMin: number
	resultMax: number
	missingWeight: number
}

export interface NormalizedLecturer extends Lecturers {
	room_short: string
}

export interface AvailableRoom {
	from: Date
	until: Date
	room: string
	type: string
	capacity: number
}

export interface FriendlyTimetableEntry {
	date: Date
	startDate: Date
	endDate: Date
	name: string
	shortName: string
	rooms: string[]
	lecturer: string
	exam?: string
	course: string
	studyGroup: string
	sws: string
	ects: string
	goal: string | null
	contents: string | null
	literature: string | null
}

export interface TimetableEntry extends FriendlyTimetableEntry {
	eventType: 'timetable'
}
export interface TimetableCalendarEntry {
	eventType: 'calendar'
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
	originalStartDate?: Date
	originalEndDate?: Date | null
}

export interface TimetableCampusLifeEntry {
	eventType: 'campus-life'
	id: string
	numericId: number
	date: Date
	startDate: Date
	endDate: Date
	name:
		| {
				en?: string | null
				de?: string | null
				[key: string]: string | null | undefined
		  }
		| string
	hostName: string
	location?: string | null
}

export interface TimetableSections {
	title: Date
	data: (
		| TimetableEntry
		| ExamEntry
		| TimetableCalendarEntry
		| TimetableCampusLifeEntry
	)[]
}

export interface CalendarEvent {
	start: Date
	end: Date
	title: string
	textColor: string
	color: string
	location?: string
	entry?: FriendlyTimetableEntry
}
