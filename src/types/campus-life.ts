/** `organizer_kind` query value for Campus Life public list APIs */
export const CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION =
	'STUDENT_ASSOCIATION' as const
export const CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT =
	'THI_DEPARTMENT' as const

export type CampusLifePublicOrganizerKind =
	| typeof CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
	| typeof CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT

export interface PublicEventResponse {
	id: number
	organizer_id: number
	organizer_kind?: CampusLifePublicOrganizerKind | string | null
	organizer_name?: string | null
	title_de: string
	title_en: string
	start_date_time: string
	end_date_time: string
	description_de?: string | null
	description_en?: string | null
	location?: string | null
	event_url?: string | null
}

export interface PublicOrganizerResponse {
	id: number
	organizer_kind?: CampusLifePublicOrganizerKind | string | null
	name: string
	description_de?: string | null
	description_en?: string | null
	instagram_url?: string | null
	linkedin_url?: string | null
	website_url?: string | null
	location?: string | null
	non_profit?: boolean | null
	registration_number?: string | null
}

export interface CampusLifeOrganizer {
	id: number
	organizerKind?: CampusLifePublicOrganizerKind
	name: string
	descriptions: {
		de?: string | null
		en?: string | null
	}
	location?: string | null
	instagram?: string | null
	website?: string | null
	linkedin?: string | null
	nonProfit?: boolean | null
	registrationNumber?: string | null
}

export interface CampusLifeEvent {
	id: string
	numericId: number
	organizerKind?: CampusLifePublicOrganizerKind
	titles: {
		de: string
		en: string
	}
	descriptions: {
		de?: string | null
		en?: string | null
	}
	startDateTime: string
	endDateTime: string
	location?: string | null
	host: CampusLifeOrganizer
	eventUrl?: string | null
}

export interface FriendlyCampusLifeEvent extends CampusLifeEvent {
	eventType: 'campus-life'
}

export interface CampusLifeEventEntry extends FriendlyCampusLifeEvent {
	date: Date
	startDate: Date
	endDate: Date | null
}
