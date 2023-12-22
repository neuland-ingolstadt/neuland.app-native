import NeulandAPI from '@/api/neuland-api'
import allergenMap from '@/data/allergens.json'
import flapMap from '@/data/mensa-flags.json'
import { type FoodLanguage } from '@/hooks/contexts/foodFilter'
import {
    USER_EMPLOYEE,
    USER_GUEST,
    USER_STUDENT,
} from '@/hooks/contexts/userKind'
import { type LanguageKey } from '@/localization/i18n'
import { type Food, type Meal, type Name } from '@/types/neuland-api'
import { type Labels, type Prices } from '@/types/utils'

import { formatISODate, getAdjustedDay, getMonday } from './date-utils'

/**
 * Fetches and parses the meal plan
 * @param {string[]} restaurants Requested restaurants
 * @returns {object[]}
 */
export async function loadFoodEntries(
    restaurants: string[],
    includeStatic: boolean
): Promise<Food[]> {
    const entries: Food[] = []
    if (restaurants.includes('mensa')) {
        let data
        try {
            data = await NeulandAPI.getMensaPlan()
        } catch (e) {
            console.log(e)
            data = []
        }
        data.forEach((day: Food) => {
            day.meals.forEach((entry: any) => {
                entry.restaurant = 'Mensa'
            })
        })
        entries.push(data)
    }

    if (restaurants.includes('reimanns')) {
        let data
        try {
            data = await NeulandAPI.getReimannsPlan()
        } catch (e) {
            console.log(e)
            data = []
        }

        const startOfToday = new Date(formatISODate(new Date())).getTime()
        const filteredData = data.filter(
            (x: any) => new Date(x.timestamp).getTime() >= startOfToday
        )

        filteredData.forEach((day: any) => {
            day.meals = day.meals.filter(
                (entry: any) => entry.static === includeStatic
            )
            day.meals.forEach((entry: any) => {
                entry.restaurant = 'Reimanns'
            })
        })
        entries.push(filteredData)
    }

    if (restaurants.includes('canisius')) {
        let data = []
        try {
            data = await NeulandAPI.getCanisiusPlan()
        } catch (e) {
            console.log(e)
            data = []
        }

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
            timestamp: day,
            meals: dayEntries,
        }
    })
}

/**
 * Converts an array of allergens to a string of relevant allergens
 * @param {string[]} allergens Array of allergens
 * @param {string[]} selectedAllergens Array of selected allergens
 * @returns {string} String of relevant allergens
 */
export function convertRelevantAllergens(
    allergens: string[],
    selectedAllergens: string[],
    language: string
): string {
    const relevantAllergens = allergens?.filter(
        (allergen) => selectedAllergens?.includes(allergen)
    )
    const convertedAllergens = relevantAllergens?.map(
        (allergen) =>
            allergenMap[allergen as keyof typeof allergenMap][
                language as 'de' | 'en'
            ]
    )
    return convertedAllergens?.join(' • ')
}

/**
 * Converts an array of flags to an array of relevant flags
 * @param {string[]} flags Array of flags
 * @param {string[]} selectedFlags Array of selected flags
 * @returns {string[]} Array of relevant flags
 */
export function convertRelevantFlags(
    flags: string[],
    selectedFlags: string[],
    language: string
): string[] {
    const relevantFlags = flags?.filter((flag) => selectedFlags?.includes(flag))
    const convertedFlags = relevantFlags?.map(
        (flag) => flapMap[flag as keyof typeof flapMap][language as LanguageKey]
    )
    return convertedFlags
}

/**
 * Formats a price to a string with euro sign
 * @param {number} price Price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price?: number): string {
    return price != null ? price.toFixed(2) + ' €' : ''
}

/**
 * Formats a price according to the users group (student, employee or guest).
 * @param {object} meal Parsed meal object
 * @param {string} userKind User group (student, employee or guest)
 * @returns {string}
 */
export function getUserSpecificPrice(meal: Meal, userKind: string): string {
    const prices: Prices = {
        guest: meal.prices.guest,
        employee: meal.prices.employee,
        student: meal.prices.student,
    }
    return formatPrice(prices[userKind])
}

/**
 * Returns a label according to the users group (student, employee or guest).
 * @param {string} userKind User group (student, employee or guest)
 * @returns {string}
 */

export function getUserSpecificLabel(userKind: string, t: any): string {
    const labels: Labels = {
        [USER_GUEST]: t('price.guests'),
        [USER_EMPLOYEE]: t('price.employees'),
        [USER_STUDENT]: t('price.students'),
    }
    return labels[userKind]
}

/**
 * Returns the name of a meal in the correct language.
 * @param mealName Array with the name of the meal in different languages (de, en)
 * @param {FoodLanguage} foodLang Food language set by the user (de, en, default)
 * @param {LanguageKey} i18nLang Language set by the user (de, en)
 * @returns
 */
export function mealName(
    mealName: Name,
    foodLang: FoodLanguage,
    i18nLang: LanguageKey
): string {
    if (foodLang !== 'default') {
        return mealName[foodLang as LanguageKey]
    } else {
        return mealName[i18nLang as LanguageKey]
    }
}
