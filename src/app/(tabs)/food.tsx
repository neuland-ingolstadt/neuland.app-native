import allergenMap from '@/stores/data/allergens.json'
import flapMap from '@/stores/data/mensa-flags.json'
import { type Colors, FoodFilterContext } from '@/stores/provider'
import { type CanteenFlags } from '@/stores/types/data'
import { type Food, type Meal } from '@/stores/types/neuland-api'
import { loadFoodEntries } from '@/utils/food-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import Collapsible from 'react-native-collapsible'

enum LoadingState {
    LOADING,
    LOADED,
    ERROR,
}

export function convertFlags(flags: string[]): string[] {
    return flags
        ?.map((flag: string) => flapMap[flag as keyof CanteenFlags].en)
        .sort()
}

export function convertRelevantAllergens(
    allergens: string[],
    selectedAllergens: string[]
): string {
    const relevantAllergens = allergens?.filter(
        (allergen) => selectedAllergens?.includes(allergen)
    )
    const convertedAllergens = relevantAllergens?.map(
        (allergen) => allergenMap[allergen as keyof typeof allergenMap].en
    )
    return convertedAllergens?.join(' • ')
}

export function convertRelevantFlags(
    flags: string[],
    selectedFlags: string[]
): string[] {
    const relevantFlags = flags?.filter((flag) => selectedFlags?.includes(flag))
    const convertedFlags = relevantFlags?.map(
        (flag) => flapMap[flag as keyof typeof flapMap].en
    )
    return convertedFlags
}

export function formatPrice(price?: number): string {
    return price != null ? price.toFixed(2) + ' €' : ''
}
export default function FoodScreen(): JSX.Element {
    const [days, setDays] = useState<any>([])
    const colors = useTheme().colors as Colors
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const [selectedDay, setSelectedDay] = useState<number>(0)
    const { selectedRestaurants, preferencesSelection, allergenSelection } =
        useContext(FoodFilterContext)
    const router = useRouter()

    useEffect(() => {
        function load(): void {
            loadFoodEntries(selectedRestaurants)
                .then((loadedDays: Food[]) => {
                    const filteredDays: Food[] = loadedDays.filter(
                        (day: Food) =>
                            new Date(day.timestamp).getTime() >=
                            new Date().setHours(0, 0, 0, 0)
                    )
                    const formattedDays: Food[] = filteredDays.map(
                        (day: Food) => ({
                            timestamp: day.timestamp,
                            meals: day.meals,
                        })
                    )
                    setDays(formattedDays)

                    setLoadingState(LoadingState.LOADED)
                })
                .catch((e: Error) => {
                    console.error(e)
                    setLoadingState(LoadingState.ERROR)
                    alert(e)
                })
        }

        load()
    }, [selectedRestaurants])

    const MealEntry = ({
        meal,
        index,
    }: {
        meal: any
        index: number
    }): JSX.Element => {
        const userAllergens = convertRelevantAllergens(
            meal.allergens,
            allergenSelection
        )
        return (
            <Pressable
                onPress={() => {
                    router.push({
                        pathname: '(food)/details',
                        params: { foodEntry: JSON.stringify(meal) },
                    })
                }}
                style={({ pressed }) => [
                    { opacity: pressed ? 0.8 : 1 },
                    { marginTop: 8 },
                ]}
            >
                <View
                    key={index}
                    style={{
                        backgroundColor: colors.card,
                        padding: 16,

                        width: '100%',
                        alignSelf: 'center',
                        borderRadius: 8,
                        shadowColor: colors.text,
                        shadowOffset: {
                            width: 0,
                            height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1,
                        elevation: 1,
                    }}
                >
                    <Text
                        style={{
                            color: colors.text,
                            fontWeight: '600',
                            fontSize: 16,
                        }}
                        adjustsFontSizeToFit={true}
                        numberOfLines={2}
                    >
                        {meal.name.en}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',

                            paddingTop: 4,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'column',
                                flex: 1,
                                paddingTop: 2,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignContent: 'center',
                                }}
                            >
                                {convertRelevantFlags(
                                    meal.flags,
                                    preferencesSelection
                                )?.map((flag: string, index: number) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: 'row',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 4,
                                            backgroundColor:
                                                colors.labelBackground,
                                            marginRight: 4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: colors.text,
                                                paddingHorizontal: 4,
                                                paddingVertical: 2,
                                            }}
                                        >
                                            {flag}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            {userAllergens?.length > 0 && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        marginTop: 6,
                                        width: '80%',
                                    }}
                                >
                                    <Ionicons
                                        name={'warning-outline'}
                                        size={16}
                                        style={{
                                            marginRight: 4,
                                            alignSelf: 'center',
                                        }}
                                        color={colors.notification}
                                    />

                                    <Text
                                        style={{
                                            fontSize: 12,

                                            color: colors.labelColor,
                                        }}
                                        numberOfLines={3}
                                    >
                                        {userAllergens}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View
                            style={{
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-end',
                                alignSelf: 'flex-end',
                                paddingRight: 4,
                                marginRight: 4,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 14,
                                    fontWeight: '500',
                                    alignSelf: 'flex-end',
                                }}
                            >
                                {formatPrice(meal.prices.student)}
                            </Text>
                            <Text
                                style={{
                                    color: colors.labelColor,
                                    fontSize: 12,

                                    alignSelf: 'flex-end',
                                }}
                            >
                                for students
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        )
    }

    interface MealGroupProps {
        group: Record<string, Meal[]>
    }

    interface MealCategoryProps {
        category: string
        meals: Meal[]
    }

    const MealGroup = ({ group }: MealGroupProps): JSX.Element => {
        console.log(JSON.stringify(group))
        return (
            <>
                {Object.entries(group).map(([key, value]) => (
                    <MealCategory key={key} category={key} meals={value} />
                ))}
            </>
        )
    }

    const MealCategory = ({
        category,
        meals,
    }: MealCategoryProps): JSX.Element => {
        const [collapsed, setCollapsed] = useState(false)

        const toggleCollapsed = (): void => {
            setCollapsed(!collapsed)
        }

        return (
            <>
                <View key={category} style={{ paddingBottom: 10 }}>
                    <Pressable
                        onPress={() => {
                            toggleCollapsed()
                        }}
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: 2,
                                paddingBottom: 4,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.labelColor,
                                    fontSize: 14,
                                    fontWeight: '500',
                                }}
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
                                style={{
                                    marginRight: 4,
                                    alignSelf: 'center',
                                }}
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

    const mealDay = (day: any, index: number): JSX.Element => {
        // group the items by meal.category

        const filterMealsByRestaurant = (
            meals: any[],
            restaurant: string
        ): any[] => {
            return meals.filter((meal: any) => meal.restaurant === restaurant)
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
        const renderRestaurantView = ({
            restaurantName,
            meals,
            groupedMeals,
        }: RestaurantProps): JSX.Element | null => {
            if (meals.length > 0) {
                return (
                    <View style={{}}>
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
                        justifyContent: 'center',
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

    const DayButton = ({
        day,
        index,
    }: {
        day: any
        index: number
    }): JSX.Element => {
        const date = new Date(day.timestamp)
        const { colors } = useTheme()

        const daysCnt = days.length < 5 ? days.length : 5
        const isFirstDay = index === 0
        const isLastDay = index === daysCnt - 1

        const buttonStyle = [
            { flex: 1, marginHorizontal: 4 },
            isFirstDay ? { marginLeft: 0 } : null,
            isLastDay ? { marginRight: 0 } : null,
        ]

        return (
            <View style={buttonStyle} key={index}>
                {/* Assign a unique key prop to the top-level View element */}
                <Pressable
                    onPress={() => {
                        void Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                        )
                        setSelectedDay(index)
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                    <View
                        style={{
                            backgroundColor: colors.card,
                            width: '100%',
                            alignSelf: 'center',
                            borderRadius: 8,
                            shadowColor: colors.text,
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.1,
                            shadowRadius: 1,
                            elevation: 1,
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    selectedDay === index
                                        ? colors.primary
                                        : colors.text,
                                fontWeight: '500',
                                fontSize: 16,
                            }}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        >
                            {date
                                .toLocaleDateString('de-DE', {
                                    weekday: 'short',
                                })
                                .slice(0, 2)}
                        </Text>
                        <Text
                            style={{
                                color:
                                    selectedDay === index
                                        ? colors.primary
                                        : colors.text,
                                fontSize: 15,
                            }}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        >
                            {date.toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'numeric',
                            })}
                        </Text>
                    </View>
                </Pressable>
            </View>
        )
    }

    return (
        <>
            {loadingState === LoadingState.LOADING ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : loadingState === LoadingState.ERROR ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: colors.labelColor }}>
                        Error while loading food data.
                    </Text>
                </View>
            ) : (
                <ScrollView>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '92%',
                            alignSelf: 'center',
                            paddingTop: 16,
                        }}
                    >
                        {days.slice(0, 5).map((day: Food, index: number) => (
                            <DayButton day={day} index={index} key={index} />
                        ))}
                    </View>
                    {mealDay(days[selectedDay], selectedDay)}
                </ScrollView>
            )}
        </>
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
})
