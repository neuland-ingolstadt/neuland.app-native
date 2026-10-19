import type { SFSymbol } from 'expo-symbols'
import NeulandAPI from '@/api/neuland-api'
import { listUniversitySports } from '@/api/neuland-core-api'
import type {
	CampusLifeEvent,
	CampusLifeOrganizer,
	CampusLifePublicOrganizerKind,
	PublicEventResponse,
	PublicOrganizerResponse
} from '@/types/campus-life'
import type { MaterialIcon } from '@/types/material-icons'
import type {
	Sports,
	SportsCategoryEnum,
	WeekdayEnum
} from '@/types/university-sports'
import { weekdaySortIndex } from '@/types/university-sports'
import { parseApiOrganizerKind } from '@/utils/campus-life-utils'

const FALLBACK_ORGANIZER_NAME = 'Campus Life'

function mapOrganizerResponse(
	organizer: PublicOrganizerResponse | null | undefined,
	defaults: { id: number; name?: string }
): CampusLifeOrganizer {
	const organizerKind = parseApiOrganizerKind(organizer?.organizer_kind)

	return {
		id: organizer?.id ?? defaults.id,
		...(organizerKind != null ? { organizerKind } : {}),
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
	const organizerKind =
		parseApiOrganizerKind(event.organizer_kind) ?? organizer.organizerKind

	return {
		id: event.id.toString(),
		numericId: event.id,
		...(organizerKind != null ? { organizerKind } : {}),
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
	/** Defaults to student associations; pass `null` to omit the filter. */
	organizerKind?: CampusLifePublicOrganizerKind | string | null
}

/**
 * Fetches and parses the campus life events
 */
export async function loadCampusLifeEvents(
	options: LoadCampusLifeEventsOptions = {}
): Promise<CampusLifeEvent[]> {
	const {
		organizerId,
		upcomingOnly = true,
		limit,
		offset,
		organizerKind
	} = options

	const events = await NeulandAPI.getPublicCampusLifeEvents({
		organizerId,
		upcomingOnly,
		limit,
		offset,
		...(organizerKind !== undefined ? { organizerKind } : {})
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

export async function loadCampusLifeEvent(
	id: number
): Promise<CampusLifeEvent> {
	const event = await NeulandAPI.getPublicCampusLifeEvent(id)
	const organizer = mapOrganizerResponse(null, {
		id: event.organizer_id,
		name: event.organizer_name ?? undefined
	})
	return mapEventResponse(event, organizer)
}

export async function loadCampusLifeOrganizer(
	id: number
): Promise<CampusLifeOrganizer> {
	const organizer = await NeulandAPI.getPublicOrganizer(id)
	return mapOrganizerResponse(organizer, { id })
}

export async function loadCampusLifeOrganizers(
	organizerKind?: CampusLifePublicOrganizerKind | string | null
): Promise<CampusLifeOrganizer[]> {
	const organizers = await NeulandAPI.getPublicOrganizers({ organizerKind })
	return organizers.map((organizer) =>
		mapOrganizerResponse(organizer, { id: organizer.id })
	)
}

/**
 * Groups university sports events by weekday.
 */
export type GroupedSportsEvents = {
	title: WeekdayEnum
	data: Sports[]
}[]

/**
 * Fetches and groups university sports by weekday (Core API contract shape).
 */
export async function loadUniversitySportsEvents(): Promise<GroupedSportsEvents> {
	const universitySportsEvents = await listUniversitySports()
	if (universitySportsEvents.length === 0) {
		return []
	}
	const groupedEvents: Partial<Record<WeekdayEnum, Sports[]>> = {}
	for (const event of universitySportsEvents) {
		const bucket = groupedEvents[event.weekday]
		if (bucket == null) {
			groupedEvents[event.weekday] = [event]
		} else {
			bucket.push(event)
		}
	}

	return (Object.keys(groupedEvents) as WeekdayEnum[])
		.map((weekday) => ({
			title: weekday,
			data: groupedEvents[weekday] ?? []
		}))
		.sort((a, b) => weekdaySortIndex(a.title) - weekdaySortIndex(b.title))
}

interface SportsCategory {
	iosIcon: SFSymbol
	iosFallback?: SFSymbol
	androidIcon: MaterialIcon
}

export const sportsCategories: Record<SportsCategoryEnum, SportsCategory> = {
	BADMINTON: {
		iosIcon: 'figure.badminton',
		androidIcon: 'sports_tennis'
	},
	BASEBALL: {
		iosIcon: 'figure.baseball',
		androidIcon: 'sports_baseball'
	},
	BASKETBALL: {
		iosIcon: 'figure.basketball',
		androidIcon: 'sports_basketball'
	},
	BOULDERING: {
		iosIcon: 'figure.climbing',
		androidIcon: 'sports'
	},
	BOXING: {
		iosIcon: 'figure.boxing',
		androidIcon: 'sports_mma'
	},
	CALISTHENICS: {
		iosIcon: 'figure.play',
		androidIcon: 'sports'
	},
	CYCLING: {
		iosIcon: 'figure.outdoor.cycle',
		androidIcon: 'directions_bike'
	},
	DANCING: {
		iosIcon: 'figure.socialdance',
		androidIcon: 'nightlife'
	},
	DEFENSE: {
		iosIcon: 'figure.wave',
		androidIcon: 'front_hand'
	},
	FOOTBALL: {
		iosIcon: 'figure.soccer',
		iosFallback: 'figure.soccer',
		androidIcon: 'sports_soccer'
	},
	FRISBEE: {
		iosIcon: 'figure.disc.sports',
		androidIcon: 'sports'
	},
	FULL_BODY_WORKOUT: {
		iosIcon: 'figure.core.training',
		androidIcon: 'sports_gymnastics'
	},
	HANDBALL: {
		iosIcon: 'figure.handball',
		androidIcon: 'sports_handball'
	},
	HIKING: {
		iosIcon: 'figure.hiking',
		androidIcon: 'hiking'
	},
	HOCKEY: {
		iosIcon: 'figure.hockey',
		androidIcon: 'sports_hockey'
	},
	JOGGING: {
		iosIcon: 'figure.run',
		androidIcon: 'directions_run'
	},
	KICKBOXING: {
		iosIcon: 'figure.kickboxing',
		androidIcon: 'sports_mma'
	},
	MARTIAL_ARTS: {
		iosIcon: 'figure.martial.arts',
		androidIcon: 'sports_martial_arts'
	},
	MEDITATION: {
		iosIcon: 'figure.mind.and.body',
		androidIcon: 'self_improvement'
	},
	PARKOUR: {
		iosIcon: 'figure.track.and.field',
		androidIcon: 'falling'
	},
	ROWING: {
		iosIcon: 'figure.rower',
		iosFallback: 'figure.rower',
		androidIcon: 'rowing'
	},
	RUNNING: {
		iosIcon: 'figure.run',
		androidIcon: 'directions_run'
	},
	SKATEBOARDING: {
		iosIcon: 'figure.skating',
		iosFallback: 'figure.skating',
		androidIcon: 'skateboarding'
	},
	SPIKEBALL: {
		iosIcon: 'figure.softball',
		androidIcon: 'sports_and_outdoors'
	},
	STRENGTH_TRAINING: {
		iosIcon: 'figure.strengthtraining.traditional',
		androidIcon: 'fitness_center'
	},
	SWIMMING: {
		iosIcon: 'figure.pool.swim',
		androidIcon: 'pool'
	},
	TABLE_TENNIS: {
		iosIcon: 'figure.table.tennis',
		androidIcon: 'sports_tennis'
	},
	TENNIS: {
		iosIcon: 'figure.tennis',
		androidIcon: 'sports_tennis'
	},
	VOLLEYBALL: {
		iosIcon: 'figure.volleyball',
		androidIcon: 'sports_volleyball'
	},
	WATERPOLO: {
		iosIcon: 'figure.waterpolo',
		androidIcon: 'pool'
	},
	YOGA: {
		iosIcon: 'figure.yoga',
		androidIcon: 'sports_gymnastics'
	},
	OTHER: {
		iosIcon: 'figure.mixed.cardio',
		androidIcon: 'sports'
	}
}

export function getSportsCategoryIcons(
	category: SportsCategoryEnum | string | null | undefined
): SportsCategory {
	if (category != null && category in sportsCategories) {
		return sportsCategories[category as SportsCategoryEnum]
	}
	return sportsCategories.OTHER
}

export const QUERY_KEYS = {
	// V2: Core API shape (`contents` instead of GraphQL `title`)
	UNIVERSITY_SPORTS: 'universitySportsV2',
	CAMPUS_LIFE_EVENTS: 'campusLifeEventsV7',
	CAMPUS_LIFE_ORGANIZER: 'campusLifeOrganizerV2',
	CAMPUS_LIFE_ORGANIZERS: 'campusLifeOrganizersV3'
} as const
