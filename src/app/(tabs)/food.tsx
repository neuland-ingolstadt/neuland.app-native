import { MealDay } from '@/components/Food'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext } from '@/stores/provider'
import { type Food } from '@/stores/types/neuland-api'
import { loadFoodEntries } from '@/utils/food-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import React, { useContext, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

enum LoadingState {
    LOADING,
    LOADED,
    ERROR,
    REFRESHING,
}

export default function FoodScreen(): JSX.Element {
    const [days, setDays] = useState<any>([])
    const colors = useTheme().colors as Colors
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const [selectedDay, setSelectedDay] = useState<number>(0)
    const { selectedRestaurants } = useContext(FoodFilterContext)
    const [error, setError] = useState<Error | null>(null)

    const loadData = (): void => {
        loadFoodEntries(selectedRestaurants)
            .then((loadedDays: Food[]) => {
                const filteredDays: Food[] = loadedDays.filter(
                    (day: Food) =>
                        new Date(day.timestamp).getTime() >=
                        new Date().setHours(0, 0, 0, 0)
                )
                const formattedDays: Food[] = filteredDays.map((day: Food) => ({
                    timestamp: day.timestamp,
                    meals: day.meals,
                }))
                if (formattedDays.length === 0) {
                    setError(new Error('No meals available'))
                    setLoadingState(LoadingState.ERROR)
                    return
                }
                setDays(formattedDays)
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e: Error) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }

    const onRefresh: () => void = () => {
        loadData()
    }

    useEffect(() => {
        loadData()
    }, [selectedRestaurants])

    /**
     * Renders a button for a specific day's food data.
     * @param {Food} day - The food data for the day.
     * @param {number} index - The index of the day in the list of days.
     * @returns {JSX.Element} - The rendered button component.
     */
    const DayButton = ({
        day,
        index,
    }: {
        day: Food
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
                        void Haptics.selectionAsync()
                        setSelectedDay(index)
                    }}
                >
                    <View
                        style={[
                            styles.dayButtonContainer,
                            {
                                backgroundColor: colors.card,
                                shadowColor: colors.text,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color:
                                    selectedDay === index
                                        ? colors.primary
                                        : colors.text,
                                fontWeight:
                                    selectedDay === index ? '600' : '500',
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
                                fontWeight:
                                    selectedDay === index ? '500' : 'normal',
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
            <ScrollView
                refreshControl={
                    loadingState !== LoadingState.LOADING &&
                    loadingState !== LoadingState.LOADED ? (
                        <RefreshControl
                            refreshing={
                                loadingState === LoadingState.REFRESHING
                            }
                            onRefresh={onRefresh}
                        />
                    ) : undefined
                }
            >
                {loadingState === LoadingState.LOADING && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
                {loadingState === LoadingState.ERROR && (
                    <View>
                        <Text
                            style={[
                                styles.errorMessage,
                                { color: colors.text },
                            ]}
                        >
                            {error?.message}
                        </Text>
                        <Text
                            style={[styles.errorInfo, { color: colors.text }]}
                        >
                            An error occurred while loading the data.{'\n'}Pull
                            down to refresh.
                        </Text>
                    </View>
                )}

                {loadingState === LoadingState.LOADED && (
                    <>
                        <View style={styles.loadedContainer}>
                            {days
                                .slice(0, 5)
                                .map((day: Food, index: number) => (
                                    <DayButton
                                        day={day}
                                        index={index}
                                        key={index}
                                    />
                                ))}
                        </View>
                        {MealDay(days[selectedDay], selectedDay, colors)}
                    </>
                )}
            </ScrollView>
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
    errorMessage: {
        paddingTop: 100,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    loadedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '92%',
        alignSelf: 'center',
        paddingTop: 16,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayButtonContainer: {
        width: '100%',
        alignSelf: 'center',
        borderRadius: 8,
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
    },
})
