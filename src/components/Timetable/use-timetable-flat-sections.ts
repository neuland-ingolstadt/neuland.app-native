import { useMemo } from 'react'
import type { CalendarEntry } from '@/types/timetable'
import type {
	Exam,
	ExamEntry,
	FriendlyTimetableEntry,
	TimetableEntry
} from '@/types/utils'
import { calendar } from '@/utils/calendar-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'

export type TimetableItem = TimetableEntry | ExamEntry | CalendarEntry

export type TimetableSection = {
	title: Date
	data: TimetableItem[]
}

export type FlatListItem =
	| { type: 'header'; title: Date }
	| { type: 'item'; data: TimetableItem; originalIndex: number }

interface UseTimetableFlatSectionsParams {
	timetable: FriendlyTimetableEntry[]
	exams: Exam[]
	showExams: boolean
	showCalendarEvents: boolean
	today: Date
}

export function useTimetableFlatSections({
	timetable,
	exams,
	showExams,
	showCalendarEvents,
	today
}: UseTimetableFlatSectionsParams) {
	const examsList = showExams ? exams : []

	const filteredTimetableSections = useMemo(() => {
		const grouped = getGroupedTimetable(
			timetable,
			examsList,
			showCalendarEvents,
			calendar
		)
		return grouped.filter((section) => section.title >= today)
	}, [timetable, examsList, showCalendarEvents, today])

	const flatData = useMemo(() => {
		const data: FlatListItem[] = []
		for (const section of filteredTimetableSections) {
			data.push({ type: 'header', title: section.title })
			let itemIndex = 0
			for (const item of section.data) {
				data.push({ type: 'item', data: item, originalIndex: itemIndex })
				itemIndex++
			}
		}
		return data
	}, [filteredTimetableSections])

	return { flatData, filteredTimetableSections }
}

export function getTimetableFlatListKey(
	item: FlatListItem,
	index: number
): string {
	const dateKeyPart = (date: Date | undefined | null): string => {
		return date instanceof Date && !Number.isNaN(date.getTime())
			? date.toISOString()
			: `invalid-date-${index}`
	}

	if (item.type === 'header') {
		return `header-${dateKeyPart(item.title)}`
	}

	const data = item.data
	if (data.eventType === 'exam') {
		return `exam-${data.name}-${dateKeyPart(data.date)}`
	}
	if (data.eventType === 'calendar') {
		const eventName =
			typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
		return `calendar-${eventName}-${dateKeyPart(data.startDate)}`
	}

	const timetableItem = data as FriendlyTimetableEntry
	return `lecture-${timetableItem.name}-${dateKeyPart(timetableItem.startDate)}-${timetableItem.rooms?.join('-') ?? 'no-rooms'}`
}
