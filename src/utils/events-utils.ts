import NeulandAPI from '@/api/neuland-api'
import { type CLEvents } from '@/types/neuland-api'

/**
 * Fetches and parses the campus life events
 * @returns {Promise<CLEvents[]>}
 */
export async function loadCampusLifeEvents(): Promise<CLEvents[]> {
    const campusLifeEvents =
        (await NeulandAPI.getCampusLifeEvents()) as CLEvents[]

    const newEvents = campusLifeEvents
        .map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(x.begin) : null,
            end: x.end !== null ? new Date(x.end) : null,
        }))
        .filter((x) => x.end === null || x.end > new Date())
    return newEvents
}
