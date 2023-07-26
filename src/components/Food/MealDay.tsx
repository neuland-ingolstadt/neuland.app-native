import { type Colors } from '@/stores/provider'
import { type Meal } from '@/stores/types/neuland-api'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'

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
}): JSX.Element => {
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
}): JSX.Element => {
    const [collapsed, setCollapsed] = useState(false)

    /**
     * Toggles the collapsed state of the category.
     */
    const toggleCollapsed = (): void => {
        setCollapsed(!collapsed)
    }
    const colors = useTheme().colors as Colors
    return (
        <>
            <View key={category} style={{ paddingBottom: 10 }}>
                <Pressable
                    onPress={() => {
                        toggleCollapsed()
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                    <View style={styles.categoryContainer}>
                        <Text
                            style={[
                                styles.categoryText,
                                { color: colors.labelColor },
                            ]}
                        >
                            {category}
                        </Text>
                        <Ionicons
                            name={
                                collapsed
                                    ? 'chevron-down-outline'
                                    : 'chevron-up-outline'
                            }
                            size={16}
                            style={styles.warningIcon}
                            color={colors.primary}
                        />
                    </View>
                </Pressable>
                <Collapsible collapsed={collapsed}>
                    {meals.map((meal: any, index: number) => (
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
export const MealDay = (
    day: any,
    index: number,
    colors: Colors
): JSX.Element => {
    /**
     * Filters an array of meals by restaurant name.
     * @param meals - An array of meals.
     * @param restaurant - The name of the restaurant to filter by.
     * @returns An array of meals belonging to the specified restaurant.
     */
    const filterMealsByRestaurant = (
        meals: any[],
        restaurant: string
    ): any[] => {
        return meals.filter((meal: any) => meal.restaurant === restaurant)
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

    const mensa = filterMealsByRestaurant(day.meals, 'Mensa')
    const reimanns = filterMealsByRestaurant(day.meals, 'Reimanns')
    const canisius = filterMealsByRestaurant(day.meals, 'Canisius')

    const mensaGrouped = groupMealsByCategory(mensa)
    const reimannsGrouped = groupMealsByCategory(reimanns)
    const canisiusGrouped = groupMealsByCategory(canisius)

    const isEmpy =
        mensa.length === 0 && reimanns.length === 0 && canisius.length === 0

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
    }: RestaurantProps): JSX.Element | null => {
        if (meals.length > 0) {
            return (
                <View>
                    <Text
                        style={[
                            styles.dayRestaurantTitle,
                            { color: colors.text },
                        ]}
                    >
                        {restaurantName}
                    </Text>
                    <MealGroup group={groupedMeals} />
                </View>
            )
        }
        return null
    }

    return isEmpy ? (
        <>
            <View
                style={{
                    paddingTop: 40,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: colors.text }}>
                    No meals found for this day.
                </Text>
            </View>
        </>
    ) : (
        <View key={index} style={styles.dayRestaurantContainer}>
            {renderRestaurantView({
                restaurantName: 'Mensa',
                meals: mensa,
                groupedMeals: mensaGrouped,
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

const styles = StyleSheet.create({
    dayRestaurantContainer: {
        width: '92%',
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    dayRestaurantTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        paddingBottom: 5,
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 2,
        paddingBottom: 4,
    },
    warningIcon: {
        marginRight: 4,
        alignSelf: 'center',
    },
    categoryText: {
        fontSize: 15,
        fontWeight: '500',
    },
})
