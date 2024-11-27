import NeulandAPI from '@/api/neuland-api'
import { type MaterialIcon } from '@/types/material-icons'
import { type CLEvents, type UniversitySports } from '@/types/neuland-api'
import { type SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types'

/**
 * Fetches and parses the campus life events
 * @returns {Promise<CLEvents[]>}
 */
export async function loadCampusLifeEvents(): Promise<CLEvents[]> {
    const campusLifeEvents = (await NeulandAPI.getCampusLifeEvents())
        .clEvents as CLEvents[]

    const newEvents = campusLifeEvents
        .map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(Number(x.begin)) : null,
            end: x.end !== null ? new Date(Number(x.end)) : null,
        }))
        .filter(
            (x) =>
                x.end === null ||
                x.end > new Date() ||
                x.titles.de !== '' ||
                x.titles.en !== ''
        )
    return newEvents
}

type GroupedSportsEvents = Array<{
    title: UniversitySports['weekday']
    data: UniversitySports[]
}>
/**
 * Fetches and parses the university sports events
 */
export async function loadUniversitySportsEvents(): Promise<GroupedSportsEvents> {
    const universitySportsEvents = (await NeulandAPI.getUniversitySports())
        .universitySports
    const groupedEvents: Record<string, UniversitySports[]> = {}
    const weekdays = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ]
    universitySportsEvents.forEach((event) => {
        if (groupedEvents[event.weekday] === undefined) {
            groupedEvents[event.weekday] = []
        }
        groupedEvents[event.weekday].push(event)
    })

    const sections = Object.keys(groupedEvents)
        .map((weekday) => ({
            title: weekday as UniversitySports['weekday'],
            data: groupedEvents[weekday],
        }))
        .sort((a, b) => weekdays.indexOf(a.title) - weekdays.indexOf(b.title))

    return sections
}

interface SportsCategory {
    iosIcon: SystemName
    iosFallback?: SystemName
    androidIcon: MaterialIcon
}

export const sportsCategories: Record<string, SportsCategory> = {
    Badminton: {
        iosIcon: 'figure.badminton',
        androidIcon: 'sports_tennis',
    },
    Baseball: {
        iosIcon: 'figure.baseball',
        androidIcon: 'sports_baseball',
    },
    Basketball: {
        iosIcon: 'figure.basketball',
        androidIcon: 'sports_basketball',
    },
    Boxing: {
        iosIcon: 'figure.boxing',
        androidIcon: 'sports_mma',
    },
    Calisthenics: {
        iosIcon: 'figure.play',
        androidIcon: 'sports',
    },
    MartialArts: {
        iosIcon: 'figure.martial.arts',
        androidIcon: 'sports_martial_arts',
    },
    Running: {
        iosIcon: 'figure.run',
        androidIcon: 'directions_run',
    },
    Dancing: {
        iosIcon: 'figure.socialdance',
        androidIcon: 'nightlife',
    },
    Defense: {
        iosIcon: 'figure.wave',
        androidIcon: 'front_hand',
    },
    Frisbee: {
        iosIcon: 'figure.disc.sports',
        androidIcon: 'sports',
    },
    FullBodyWorkout: {
        iosIcon: 'figure.core.training',
        androidIcon: 'sports_gymnastics',
    },
    Handball: {
        iosIcon: 'figure.handball',
        androidIcon: 'sports_handball',
    },
    Hockey: {
        iosIcon: 'figure.hockey',
        androidIcon: 'sports_hockey',
    },
    Jogging: {
        iosIcon: 'figure.run',
        androidIcon: 'directions_run',
    },
    Kickboxing: {
        iosIcon: 'figure.kickboxing',
        androidIcon: 'sports_mma',
    },
    Climbing: {
        iosIcon: 'figure.climbing',
        androidIcon: 'sports',
    },
    StrengthTraining: {
        iosIcon: 'figure.strengthtraining.traditional',
        androidIcon: 'fitness_center',
    },
    Meditation: {
        iosIcon: 'figure.mind.and.body',
        androidIcon: 'self_improvement',
    },
    Cycling: {
        iosIcon: 'figure.outdoor.cycle',
        androidIcon: 'directions_bike',
    },
    Parkour: {
        iosIcon: 'figure.track.and.field',
        androidIcon: 'falling',
    },
    Rowing: {
        iosIcon: 'figure.rower',
        iosFallback: 'figure.rower',
        androidIcon: 'rowing',
    },
    Skateboarding: {
        iosIcon: 'figure.skating',
        iosFallback: 'figure.skating',
        androidIcon: 'skateboarding',
    },
    Soccer: {
        iosIcon: 'figure.soccer',
        iosFallback: 'figure.soccer',
        androidIcon: 'sports_soccer',
    },
    Spikeball: {
        iosIcon: 'figure.softball',
        androidIcon: 'sports_and_outdoors',
    },
    Swimming: {
        iosIcon: 'figure.pool.swim',
        androidIcon: 'pool',
    },
    TableTennis: {
        iosIcon: 'figure.table.tennis',
        androidIcon: 'sports_tennis',
    },
    Tennis: {
        iosIcon: 'figure.tennis',
        androidIcon: 'sports_tennis',
    },
    Volleyball: {
        iosIcon: 'figure.volleyball',
        androidIcon: 'sports_volleyball',
    },
    Hiking: {
        iosIcon: 'figure.hiking',
        androidIcon: 'hiking',
    },
    Waterpolo: {
        iosIcon: 'figure.waterpolo',
        androidIcon: 'pool',
    },
    Yoga: {
        iosIcon: 'figure.yoga',
        androidIcon: 'sports_gymnastics',
    },
    Other: {
        iosIcon: 'figure.mixed.cardio',
        androidIcon: 'sports',
    },
}
