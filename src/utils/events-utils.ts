import NeulandAPI from '@/api/neuland-api'
import type {
	CampusLifeEvent,
	CampusLifeOrganizer,
	PublicEventResponse,
	PublicOrganizerResponse
} from '@/types/campus-life'

const FALLBACK_ORGANIZER_NAME = 'Campus Life'

function mapOrganizerResponse(
	organizer: PublicOrganizerResponse | null | undefined,
	defaults: { id: number; name?: string }
): CampusLifeOrganizer {
	return {
		id: organizer?.id ?? defaults.id,
		name: organizer?.name ?? defaults.name ?? FALLBACK_ORGANIZER_NAME,
		descriptions: {
			de: organizer?.description_de ?? null,
			en: organizer?.description_en ?? null
		},
		location: organizer?.location ?? null,
		instagram: organizer?.instagram_url ?? null,
		website: organizer?.website_url ?? null,
		linkedin: organizer?.linkedin_url ?? null,
		nonProfit: organizer?.non_profit ?? null,
		registrationNumber: organizer?.registration_number ?? null
	}
}

function mapEventResponse(
	event: PublicEventResponse,
	organizer: CampusLifeOrganizer
): CampusLifeEvent {
	return {
		id: event.id.toString(),
		numericId: event.id,
		titles: {
			de: event.title_de,
			en: event.title_en
		},
		descriptions: {
			de: event.description_de ?? null,
			en: event.description_en ?? null
		},
		startDateTime: event.start_date_time,
		endDateTime: event.end_date_time,
		location: event.location ?? null,
		eventUrl: event.event_url ?? null,
		host: organizer
	}
}

export interface LoadCampusLifeEventsOptions {
	organizerId?: number
	upcomingOnly?: boolean
	limit?: number
	offset?: number
}

/**
 * Fetches and parses the campus life events
 */
export async function loadCampusLifeEvents(
	options: LoadCampusLifeEventsOptions = {}
): Promise<CampusLifeEvent[]> {
	const { organizerId, upcomingOnly = true, limit, offset } = options

	const events = await NeulandAPI.getPublicCampusLifeEvents({
		organizerId,
		upcomingOnly,
		limit,
		offset
	})

	const now = Date.now()

	return events
		.map((event) => {
			const organizer = mapOrganizerResponse(null, {
				id: event.organizer_id,
				name: event.organizer_name ?? undefined
			})
			return mapEventResponse(event, organizer)
		})
		.filter((event) => {
			const endTime = Date.parse(event.endDateTime)
			return Number.isNaN(endTime) || endTime > now
		})
		.filter(
			(event) => event.titles.de.trim() !== '' || event.titles.en.trim() !== ''
		)
		.sort((a, b) => Date.parse(a.startDateTime) - Date.parse(b.startDateTime))
}

export async function loadCampusLifeOrganizer(
	id: number
): Promise<CampusLifeOrganizer> {
	const organizer = await NeulandAPI.getPublicOrganizer(id)
	return mapOrganizerResponse(organizer, { id })
}

export async function loadCampusLifeOrganizers(): Promise<
	CampusLifeOrganizer[]
> {
	const organizers = await NeulandAPI.getPublicOrganizers()
	return organizers.map((organizer) =>
		mapOrganizerResponse(organizer, { id: organizer.id })
	)
}

export const QUERY_KEYS = {
	CAMPUS_LIFE_EVENTS: 'campusLifeEventsV7',
	CAMPUS_LIFE_ORGANIZER: 'campusLifeOrganizerV2',
	CAMPUS_LIFE_ORGANIZERS: 'campusLifeOrganizersV3'
} as const
