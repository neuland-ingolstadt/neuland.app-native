import PlatformIcon from '@/components/Universal/Icon'
import { type Food, type Meal } from '@/types/neuland-api'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { MealEntry } from './MealEntry'

/**
 * Renders a group of meals for a given category.
 * @param group - An object containing meals grouped by category.
 * @returns A JSX element representing the group of meals.
 */
const MealGroup = ({
    group,
}: {
    group: Record<string, Meal[]>
}): React.JSX.Element => {
    return (
        <>
            {Object.entries(group).map(([key, value]) => (
                <MealCategory key={key} category={key} meals={value} />
            ))}
        </>
    )
}

/**
 * Renders a category of meals.
 * @param category - The name of the category.
 * @param meals - An array of meals belonging to the category.
 * @returns A JSX element representing the category of meals.
 */
const MealCategory = ({
    category,
    meals,
}: {
    category: string
    meals: Meal[]
}): React.JSX.Element => {
    const [collapsed, setCollapsed] = useState(false)

    /**
     * Toggles the collapsed state of the category.
     */
    const toggleCollapsed = (): void => {
        setCollapsed(!collapsed)
    }
    const { t } = useTranslation('food')

    const { styles } = useStyles(stylesheet)
    return (
        <>
            <View key={category} style={styles.categoryContainerCollapsed}>
                <Pressable
                    onPress={() => {
                        toggleCollapsed()
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    hitSlop={{ top: 6, bottom: 6 }}
                >
                    <View style={styles.categoryContainer}>
                        <Text style={styles.categoryText}>
                            {t(`categories.${category}`, category)}
                        </Text>
                        <PlatformIcon
                            ios={{
                                name: collapsed ? 'chevron.down' : 'chevron.up',
                                size: 13,
                                weight: 'semibold',
                            }}
                            android={{
                                name: collapsed ? 'expand_more' : 'expand_less',
                                size: 20,
                            }}
                            web={{
                                name: collapsed ? 'ChevronDown' : 'ChevronUp',
                                size: 20,
                            }}
                            style={styles.toggleIcon}
                        />
                    </View>
                </Pressable>
                <Collapsible collapsed={collapsed}>
                    {meals.map((meal: Meal, index: number) => (
                        <MealEntry key={index} meal={meal} index={index} />
                    ))}
                </Collapsible>
            </View>
        </>
    )
}

/**
 * Renders a day's worth of meals.
 * @param day - An object containing meals for a given day.
 * @param index - The index of the day.
 * @param colors - An object containing color values.
 * @returns A JSX element representing the day's meals.
 */
export const MealDay = ({
    day,
    index,
}: {
    day: Food
    index: number
}): React.JSX.Element => {
    const { styles } = useStyles(stylesheet)

    /**
     * Filters an array of meals by restaurant name.
     * @param meals - An array of meals.
     * @param restaurant - The name of the restaurant to filter by.
     * @returns An array of meals belonging to the specified restaurant.
     */
    const filterMealsByRestaurant = (
        meals: Meal[],
        restaurant: string
    ): Meal[] => {
        return meals.filter((meal: Meal) => meal.restaurant === restaurant)
    }
    /**
     * Groups an array of meals by category.
     * @param meals - An array of meals.
     * @returns An object containing meals grouped by category.
     */
    const groupMealsByCategory = (meals: Meal[]): Record<string, Meal[]> => {
        return meals.reduce((r: Record<string, Meal[]>, a: Meal) => {
            const category = a.category
            if (Object.prototype.hasOwnProperty.call(r, category)) {
                r[category].push(a)
            } else {
                r[category] = [a]
            }
            return r
        }, {})
    }

    const ingolstadtMensa = filterMealsByRestaurant(
        day.meals,
        'IngolstadtMensa'
    )
    const neuburgMensa = filterMealsByRestaurant(day.meals, 'NeuburgMensa')
    const reimanns = filterMealsByRestaurant(day.meals, 'Reimanns')
    const canisius = filterMealsByRestaurant(day.meals, 'Canisius')

    const ingolstadtMensaGrouped = groupMealsByCategory(ingolstadtMensa)
    const neuburgMensaGrouped = groupMealsByCategory(neuburgMensa)
    const reimannsGrouped = groupMealsByCategory(reimanns)
    const canisiusGrouped = groupMealsByCategory(canisius)

    const isEmpty =
        ingolstadtMensa.length === 0 &&
        reimanns.length === 0 &&
        canisius.length === 0 &&
        neuburgMensa.length === 0

    interface RestaurantProps {
        restaurantName: string
        meals: Meal[]
        groupedMeals: Record<string, Meal[]>
    }

    /**
     * Renders a view for a given restaurant.
     * @param restaurantName - The name of the restaurant.
     * @param meals - An array of meals belonging to the restaurant.
     * @param groupedMeals - An object containing meals grouped by category.
     * @returns A JSX element representing the restaurant's meals.
     */
    const renderRestaurantView = ({
        restaurantName,
        meals,
        groupedMeals,
    }: RestaurantProps): React.JSX.Element | null => {
        if (meals.length > 0) {
            return (
                <View>
                    <Text style={styles.dayRestaurantTitle}>
                        {restaurantName}
                    </Text>
                    <MealGroup group={groupedMeals} />
                </View>
            )
        }
        return null
    }
    const { t } = useTranslation('food')
    return isEmpty ? (
        <>
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('dashboard.empty')}</Text>
            </View>
        </>
    ) : (
        <View key={index}>
            {renderRestaurantView({
                restaurantName: 'Mensa Ingolstadt',
                meals: ingolstadtMensa,
                groupedMeals: ingolstadtMensaGrouped,
            })}
            {renderRestaurantView({
                restaurantName: 'Theke Neuburg',
                meals: neuburgMensa,
                groupedMeals: neuburgMensaGrouped,
            })}
            {renderRestaurantView({
                restaurantName: 'Reimanns',
                meals: reimanns,
                groupedMeals: reimannsGrouped,
            })}
            {renderRestaurantView({
                restaurantName: 'Canisius Konvikt',
                meals: canisius,
                groupedMeals: canisiusGrouped,
            })}
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    categoryContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 3,
        paddingTop: 3,
    },
    categoryContainerCollapsed: { paddingBottom: 8 },
    categoryText: {
        color: theme.colors.labelColor,
        fontSize: 15,
        fontWeight: '500',
    },
    dayRestaurantTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 3,
        paddingTop: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: { color: theme.colors.text, fontSize: 16 },
    toggleIcon: {
        alignSelf: 'center',
        color: theme.colors.primary,
        marginRight: 4,
    },
}))
