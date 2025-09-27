export interface PublicEventResponse {
	id: number
	organizer_id: number
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
	name: string
	description_de?: string | null
	description_en?: string | null
	instagram_url?: string | null
	website_url?: string | null
	location?: string | null
}

export interface CampusLifeOrganizer {
	id: number
	name: string
	descriptions: {
		de?: string | null
		en?: string | null
	}
	location?: string | null
	instagram?: string | null
	website?: string | null
}

export interface CampusLifeEvent {
	id: string
	numericId: number
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
