import { type Food, type Meal } from '@/stores/types/neuland-api'

import NeulandAPI from '../api/neuland-api'
import { formatISODate, getAdjustedDay, getMonday } from './date-utils'

/**
 * Fetches and parses the meal plan
 * @param {string[]} restaurants Requested restaurants (`mensa` or `reimanns`)
 * @returns {object[]}
 */
export async function loadFoodEntries(restaurants: string[]): Promise<Food[]> {
    const entries: Food[] = []

    if (restaurants.includes('mensa')) {
        const data = await NeulandAPI.getMensaPlan()
        data.forEach((day: Food) => {
            day.meals.forEach((entry: any) => {
                entry.restaurant = 'Mensa'
            })
        })
        entries.push(data)
    }

    if (restaurants.includes('reimanns')) {
        const data = await NeulandAPI.getReimannsPlan()

        const startOfToday = new Date(formatISODate(new Date())).getTime()
        const filteredData = data.filter(
            (x: any) => new Date(x.timestamp).getTime() >= startOfToday
        )

        filteredData.forEach((day: any) =>
            day.meals.forEach((entry: any) => {
                entry.restaurant = 'Reimanns'
            })
        )
        entries.push(filteredData)
    }

    if (restaurants.includes('canisius')) {
        const data = await NeulandAPI.getCanisiusPlan()

        const startOfToday = new Date(formatISODate(new Date())).getTime()
        const filteredData = data.filter(
            (x: any) => new Date(x.timestamp).getTime() >= startOfToday
        )

        filteredData.forEach((day: any) =>
            day.meals.forEach((entry: any) => {
                entry.restaurant = 'Canisius'
            })
        )
        entries.push(filteredData)
    }

    // get start of this week (monday) or next monday if isWeekend
    const startOfThisWeek = getMonday(getAdjustedDay(new Date()))

    // create day entries for next 12 days (current and next week including the weekend) starting from monday
    let days: Date[] = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(startOfThisWeek.getTime())
        date.setDate(date.getDate() + i)
        return date
    })

    // remove weekend
    days = days.filter((x) => x.getDay() !== 0 && x.getDay() !== 6)

    // map to ISO date
    const isoDates = days.map((x) => formatISODate(x))

    // map entries to daysTest
    return isoDates.map((day) => {
        const dayEntries: Meal[] = entries.flatMap(
            (r: any) => r.find((x: Food) => x.timestamp === day)?.meals ?? []
        )
        return {
            timestamp: new Date(day), // convert string to Date object
            meals: dayEntries,
        }
    })
}
