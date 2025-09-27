import type { SFSymbol } from 'expo-symbols'
import { getFragmentData } from '@/__generated__/gql'
import {
	type UniversitySportsFieldsFragment,
	UniversitySportsFieldsFragmentDoc,
	type WeekdayType
} from '@/__generated__/gql/graphql'
import NeulandAPI from '@/api/neuland-api'
import type {
	CampusLifeEvent,
	CampusLifeOrganizer,
	PublicEventResponse,
	PublicOrganizerResponse
} from '@/types/campus-life'
import type { MaterialIcon } from '@/types/material-icons'

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
		website: organizer?.website_url ?? null
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

	const eventsPromise = NeulandAPI.getPublicCampusLifeEvents({
		organizerId,
		upcomingOnly,
		limit,
		offset
	})
	const organizersPromise =
		organizerId != null
			? NeulandAPI.getPublicOrganizer(organizerId)
					.then((organizer) => [organizer])
					.catch(() => [])
			: NeulandAPI.getPublicOrganizers()
	const [events, organizers] = await Promise.all([
		eventsPromise,
		organizersPromise
	])

	const organizerById = new Map(
		organizers.map((organizer) => [organizer.id, organizer])
	)

	const now = Date.now()

	return events
		.map((event) => {
			const organizer = mapOrganizerResponse(
				organizerById.get(event.organizer_id),
				{ id: event.organizer_id }
			)
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

/**
 * Fetches and parses the campus life events
 * @returns {Promise<CampusLifeEventFieldsFragment[]>} A promise that resolves with the campus life events
 */
type GroupedSportsEvents = {
	title: WeekdayType
	data: UniversitySportsFieldsFragment[]
}[]
/**
 * Fetches and parses the university sports events
 */
export async function loadUniversitySportsEvents(): Promise<GroupedSportsEvents> {
	const events = (await NeulandAPI.getUniversitySports()).universitySports
	const universitySportsEvents = getFragmentData(
		UniversitySportsFieldsFragmentDoc,
		events
	)
	if (universitySportsEvents == null) {
		return []
	}
	const groupedEvents: Record<string, UniversitySportsFieldsFragment[]> = {}
	const weekdays = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	]
	for (const event of universitySportsEvents) {
		if (groupedEvents[event.weekday] === undefined) {
			groupedEvents[event.weekday] = []
		}
		groupedEvents[event.weekday].push(event)
	}

	const sections = Object.keys(groupedEvents)
		.map((weekday) => ({
			title: weekday as WeekdayType,
			data: groupedEvents[weekday]
		}))
		.sort((a, b) => weekdays.indexOf(a.title) - weekdays.indexOf(b.title))

	return sections
}

interface SportsCategory {
	iosIcon: SFSymbol
	iosFallback?: SFSymbol
	androidIcon: MaterialIcon
}

export const sportsCategories: Record<string, SportsCategory> = {
	Badminton: {
		iosIcon: 'figure.badminton',
		androidIcon: 'sports_tennis'
	},
	Baseball: {
		iosIcon: 'figure.baseball',
		androidIcon: 'sports_baseball'
	},
	Basketball: {
		iosIcon: 'figure.basketball',
		androidIcon: 'sports_basketball'
	},
	Boxing: {
		iosIcon: 'figure.boxing',
		androidIcon: 'sports_mma'
	},
	Calisthenics: {
		iosIcon: 'figure.play',
		androidIcon: 'sports'
	},
	MartialArts: {
		iosIcon: 'figure.martial.arts',
		androidIcon: 'sports_martial_arts'
	},
	Running: {
		iosIcon: 'figure.run',
		androidIcon: 'directions_run'
	},
	Dancing: {
		iosIcon: 'figure.socialdance',
		androidIcon: 'nightlife'
	},
	Defense: {
		iosIcon: 'figure.wave',
		androidIcon: 'front_hand'
	},
	Frisbee: {
		iosIcon: 'figure.disc.sports',
		androidIcon: 'sports'
	},
	FullBodyWorkout: {
		iosIcon: 'figure.core.training',
		androidIcon: 'sports_gymnastics'
	},
	Handball: {
		iosIcon: 'figure.handball',
		androidIcon: 'sports_handball'
	},
	Hockey: {
		iosIcon: 'figure.hockey',
		androidIcon: 'sports_hockey'
	},
	Jogging: {
		iosIcon: 'figure.run',
		androidIcon: 'directions_run'
	},
	Kickboxing: {
		iosIcon: 'figure.kickboxing',
		androidIcon: 'sports_mma'
	},
	Climbing: {
		iosIcon: 'figure.climbing',
		androidIcon: 'sports'
	},
	StrengthTraining: {
		iosIcon: 'figure.strengthtraining.traditional',
		androidIcon: 'fitness_center'
	},
	Meditation: {
		iosIcon: 'figure.mind.and.body',
		androidIcon: 'self_improvement'
	},
	Cycling: {
		iosIcon: 'figure.outdoor.cycle',
		androidIcon: 'directions_bike'
	},
	Parkour: {
		iosIcon: 'figure.track.and.field',
		androidIcon: 'falling'
	},
	Rowing: {
		iosIcon: 'figure.rower',
		iosFallback: 'figure.rower',
		androidIcon: 'rowing'
	},
	Skateboarding: {
		iosIcon: 'figure.skating',
		iosFallback: 'figure.skating',
		androidIcon: 'skateboarding'
	},
	Soccer: {
		iosIcon: 'figure.soccer',
		iosFallback: 'figure.soccer',
		androidIcon: 'sports_soccer'
	},
	Spikeball: {
		iosIcon: 'figure.softball',
		androidIcon: 'sports_and_outdoors'
	},
	Swimming: {
		iosIcon: 'figure.pool.swim',
		androidIcon: 'pool'
	},
	TableTennis: {
		iosIcon: 'figure.table.tennis',
		androidIcon: 'sports_tennis'
	},
	Tennis: {
		iosIcon: 'figure.tennis',
		androidIcon: 'sports_tennis'
	},
	Volleyball: {
		iosIcon: 'figure.volleyball',
		androidIcon: 'sports_volleyball'
	},
	Hiking: {
		iosIcon: 'figure.hiking',
		androidIcon: 'hiking'
	},
	Waterpolo: {
		iosIcon: 'figure.waterpolo',
		androidIcon: 'pool'
	},
	Yoga: {
		iosIcon: 'figure.yoga',
		androidIcon: 'sports_gymnastics'
	},
	Other: {
		iosIcon: 'figure.mixed.cardio',
		androidIcon: 'sports'
	}
}

export const QUERY_KEYS = {
	CAREER_SERVICE_EVENTS: 'thi-services-career',
	STUDENT_ADVISORY_EVENTS: 'thi-services-student-counselling',
	UNIVERSITY_SPORTS: 'universitySports',
	CAMPUS_LIFE_EVENTS: 'campusLifeEventsV6',
	CAMPUS_LIFE_ORGANIZER: 'campusLifeOrganizerV1'
} as const

export const loadCareerServiceEvents = async () => {
	const res = await NeulandAPI.getCareerServiceEvents()
	return res.careerServiceEvents
}

export const loadStudentCounsellingEvents = async () => {
	const res = await NeulandAPI.getStudentCounsellingEvents()
	return res.studentCounsellingEvents
}
