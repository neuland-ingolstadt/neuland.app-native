import { getFragmentData } from '@/__generated__/gql'
import { FoodFieldsFragmentDoc } from '@/__generated__/gql/graphql'
import NeulandAPI from '@/api/neuland-api'
import allergenMap from '@/data/allergens.json'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import flapMap from '@/data/mensa-flags.json'
import { type FoodLanguage } from '@/hooks/useFoodFilterStore'
import { type LanguageKey } from '@/localization/i18n'
import { type Food, type Meal, type Name } from '@/types/neuland-api'
import { type Labels, type Prices } from '@/types/utils'
import { trackEvent } from '@aptabase/react-native'
import { type TFunction, type i18n } from 'i18next'
import { Share } from 'react-native'

import { formatISODate } from './date-utils'

export const humanLocations = {
    IngolstadtMensa: 'Mensa Ingolstadt',
    NeuburgMensa: 'Mensa Neuburg',
    Reimanns: 'Reimanns',
    Canisius: 'Canisius Konvikt',
}

/**
 * Fetches and parses the meal plan
 * @param {string[]} restaurants Requested restaurants
 * @returns {object[]}
 */
export async function loadFoodEntries(
    restaurants: string[],
    includeStatic = false
): Promise<Food[]> {
    const foodData = (await NeulandAPI.getFoodPlan(restaurants)).food
    const data = [getFragmentData(FoodFieldsFragmentDoc, foodData).foodData]

    // create day entries for next 7 days (current and next week including the weekend) starting from monday
    let days: Date[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return date
    })

    // remove weekend
    days = days.filter((x) => x.getDay() !== 0 && x.getDay() !== 6)

    // map to ISO date
    const isoDates = days.map((x) => formatISODate(x))
    return isoDates.map((day) => {
        const dayEntries: Meal[] = data.flatMap(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (r: any) => r.find((x: Food) => x.timestamp === day)?.meals ?? []
        ) as Meal[]
        // remove static meals if includeStatic is false. otherwise return all meals
        const filteredDayEntries = dayEntries.filter(
            (meal) => includeStatic || !meal.static
        )
        const x = {
            timestamp: day,
            meals: filteredDayEntries,
        }
        return x
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
    const relevantAllergens = allergens?.filter((allergen) =>
        selectedAllergens?.includes(allergen)
    )
    const convertedAllergens = relevantAllergens?.map(
        (allergen) =>
            allergenMap[allergen as keyof typeof allergenMap][
                language as LanguageKey
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

export function getUserSpecificLabel(
    userKind: string,
    t: TFunction<'food'>
): string {
    const labels: Labels = {
        [USER_GUEST]: t('price.guests', { ns: 'food' }),
        [USER_EMPLOYEE]: t('price.employees', { ns: 'food' }),
        [USER_STUDENT]: t('price.students', { ns: 'food' }),
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
        return mealName[foodLang]
    } else {
        return mealName[i18nLang]
    }
}

/**
 * Calculates the rating of a meal for the current user. The rating is based on the user's allergen and preference selection.
 * @param meal  - The meal to calculate the rating for.
 * @returns A number representing the rating of the meal.
 */
export function userMealRating(
    meal: Meal,
    allergenSelection: string[],
    preferencesSelection: string[]
): number {
    if (meal.allergens?.some((x) => allergenSelection.includes(x)) ?? false) {
        return -1
    } else if (
        meal.flags?.some((x) => preferencesSelection.includes(x)) ??
        false
    ) {
        return 2
    } else if (meal.allergens == null && allergenSelection !== null) {
        return 0
    } else {
        return 1
    }
}

export function shareMeal(
    meal: Meal,
    i18n: i18n,
    userKind: 'guest' | 'employee' | 'student'
): void {
    trackEvent('Share', {
        type: 'meal',
    })
    void Share.share({
        message: i18n.t('details.share.message', {
            ns: 'food',
            meal: meal?.name[i18n.language as LanguageKey],
            price: formatPrice(meal.prices[userKind ?? USER_GUEST]),
            location:
                meal?.restaurant != null
                    ? humanLocations[
                          meal.restaurant as keyof typeof humanLocations
                      ]
                    : i18n.t('misc.unknown', { ns: 'common' }),

            id: meal?.id,
        }),
    })
}
