import type { FriendlyTimetableEntry } from '@/types/utils'
import { getOngoingOrNextEvent } from '@/utils/map-screen-utils'

export const TIMETABLE_NOT_FOUND_ERROR = '"Time table does not exist" (-202)'
export const TIMETABLE_EMPTY_ERROR = 'Timetable is empty'

export const TIMETABLE_IGNORED_ERRORS = [
	TIMETABLE_NOT_FOUND_ERROR,
	TIMETABLE_EMPTY_ERROR
] as const

const SOON_THRESHOLD_MS = 30 * 60 * 1000

export interface TodayStats {
	total: number
	completed: number
	ongoing: number
	remaining: number
}

export interface EventStatus {
	isOngoing: boolean
	isSoon: boolean
	isEndingSoon: boolean
	timeRemaining: number
	progress: number
}

export interface UpNextCardData {
	currentEvent: FriendlyTimetableEntry | null
	nextEvent: FriendlyTimetableEntry | null
	todayStats: TodayStats
}

function startOfDay(date: Date): Date {
	const day = new Date(date)
	day.setHours(0, 0, 0, 0)
	return day
}

function isSameDay(a: Date, b: Date): boolean {
	return startOfDay(a).getTime() === startOfDay(b).getTime()
}

function sortByStartDate(
	events: FriendlyTimetableEntry[]
): FriendlyTimetableEntry[] {
	return [...events].sort(
		(a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
	)
}

export function getTodayEvents(
	timetable: FriendlyTimetableEntry[],
	now: Date
): FriendlyTimetableEntry[] {
	const today = startOfDay(now)
	return timetable.filter((item) => isSameDay(new Date(item.startDate), today))
}

export function getTodayStats(
	todayEvents: FriendlyTimetableEntry[],
	now: Date
): TodayStats {
	const completed = todayEvents.filter(
		(item) => new Date(item.endDate) < now
	).length
	const ongoing = todayEvents.filter(
		(item) => new Date(item.startDate) <= now && new Date(item.endDate) > now
	).length
	const remaining = todayEvents.filter(
		(item) => new Date(item.startDate) > now
	).length

	return {
		total: todayEvents.length,
		completed,
		ongoing,
		remaining
	}
}

function getFollowingTodayEvent(
	currentEvent: FriendlyTimetableEntry,
	todayEvents: FriendlyTimetableEntry[],
	now: Date
): FriendlyTimetableEntry | null {
	const cutoff =
		new Date(currentEvent.startDate) <= now
			? now.getTime()
			: new Date(currentEvent.startDate).getTime()

	const following = sortByStartDate(
		todayEvents.filter((entry) => new Date(entry.startDate).getTime() > cutoff)
	)

	return following[0] ?? null
}

export function getUpNextCardData(
	timetable: FriendlyTimetableEntry[],
	now: Date
): UpNextCardData {
	const todayEvents = getTodayEvents(timetable, now)
	const todayStats = getTodayStats(todayEvents, now)
	const upNext = getOngoingOrNextEvent(timetable, now)

	if (upNext.length === 0) {
		return {
			currentEvent: null,
			nextEvent: null,
			todayStats
		}
	}

	const currentEvent = upNext[0]
	const nextEvent = getFollowingTodayEvent(currentEvent, todayEvents, now)

	return {
		currentEvent,
		nextEvent,
		todayStats
	}
}

export function getEventStatus(
	event: FriendlyTimetableEntry,
	now: Date
): EventStatus {
	const startDate = new Date(event.startDate)
	const endDate = new Date(event.endDate)

	const isOngoing = startDate <= now && endDate > now
	const isSoon =
		startDate > now && startDate.getTime() - now.getTime() <= SOON_THRESHOLD_MS
	const isEndingSoon =
		isOngoing && endDate.getTime() - now.getTime() <= SOON_THRESHOLD_MS

	const timeRemaining = Math.ceil(
		isOngoing
			? (endDate.getTime() - now.getTime()) / 60000
			: (startDate.getTime() - now.getTime()) / 60000
	)

	const progress = isOngoing
		? 1 -
			(endDate.getTime() - now.getTime()) /
				(endDate.getTime() - startDate.getTime())
		: 0

	return {
		isOngoing,
		isSoon,
		isEndingSoon,
		timeRemaining,
		progress: Math.min(Math.max(0, progress), 1)
	}
}

export function shouldShowNextEvent(
	currentEvent: FriendlyTimetableEntry | null,
	nextEvent: FriendlyTimetableEntry | null,
	now: Date
): nextEvent is FriendlyTimetableEntry {
	if (nextEvent == null || currentEvent == null) {
		return false
	}

	if (new Date(currentEvent.startDate) > now) {
		return false
	}

	return isSameDay(nextEvent.startDate, now)
}
