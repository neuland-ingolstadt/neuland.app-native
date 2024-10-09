import NeulandAPI from '@/api/neuland-api'
import { type CLEvents, type UniversitySports } from '@/types/neuland-api'

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
        .filter((x) => x.end === null || x.end > new Date())
    return newEvents
}

type GroupedSportsEvents = Array<{
    title: string
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
            title: weekday,
            data: groupedEvents[weekday],
        }))
        .sort((a, b) => weekdays.indexOf(a.title) - weekdays.indexOf(b.title))

    return sections
}
