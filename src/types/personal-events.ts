export type PersonalEventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly'

export interface PersonalEvent {
	id: string
	title: string
	location?: string
	// Floating local ISO date/time; recurrence keeps this wall-clock time.
	start: string
	end: string
	recurrence: PersonalEventRecurrence
	recurrenceUntil?: string
	createdAt: string
	updatedAt: string
}

export type PersonalEventDraft = Omit<
	PersonalEvent,
	'id' | 'createdAt' | 'updatedAt'
>

export interface PersonalEventOccurrence {
	eventType: 'personal'
	id: string
	seriesId: string
	name: string
	location?: string
	date: Date
	startDate: Date
	endDate: Date
	recurrence: PersonalEventRecurrence
}
