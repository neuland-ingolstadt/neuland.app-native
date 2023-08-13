import Divider from '@/components/Divider'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext, UserKindContext } from '@/stores/provider'
import { formatISODate } from '@/utils/date-utils'
import { getUserSpecificPrice, loadFoodEntries } from '@/utils/food-utils'
import { type Meal } from '@customTypes/neuland-api'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import BaseCard from './BaseCard'

const EventsCard = (): JSX.Element => {
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)

    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { selectedRestaurants, allergenSelection, preferencesSelection } =
        useContext(FoodFilterContext)
    const { userKind } = useContext(UserKindContext)
    const [foodEntries, setFoodEntries] = useState<
        Array<{ name: string; price: string | null }>
    >([])
    const [foodCardTitle, setFoodCardTitle] = useState('Essen')
    useEffect(() => {
        void loadData()
    }, [selectedRestaurants, allergenSelection, preferencesSelection, userKind])

    const loadData = async (): Promise<void> => {
        const restaurants =
            selectedRestaurants.length === 0 ? ['mensa'] : selectedRestaurants

        function userMealRating(meal: Meal): number {
            if (
                meal.allergens?.some(
                    (x) =>
                        allergenSelection[x as keyof typeof allergenSelection]
                ) ??
                false
            ) {
                return -1
            } else if (
                meal.flags?.some(
                    (x) =>
                        preferencesSelection[
                            x as keyof typeof preferencesSelection
                        ]
                ) ??
                false
            ) {
                return 2
            } else if (
                meal.allergens == null &&
                Object.keys(allergenSelection).some(
                    (x) =>
                        allergenSelection[x as keyof typeof allergenSelection]
                )
            ) {
                return 0
            } else {
                return 1
            }
        }

        if (restaurants.length !== 1) {
            setFoodCardTitle('Food')
        } else {
            switch (restaurants[0]) {
                case 'mensa':
                    setFoodCardTitle('Mensa')
                    break
                case 'reimanns':
                    setFoodCardTitle('Reimanns')
                    break
                case 'canisius':
                    setFoodCardTitle('Canisius')
                    break
                default:
                    setFoodCardTitle('Food')
                    break
            }
        }

        const today = formatISODate(new Date())

        try {
            const entries = await loadFoodEntries(restaurants)
            const todayEntries = entries
                .find((x) => x.timestamp === today)
                ?.meals.filter(
                    (x) =>
                        x.category !== 'Suppe' &&
                        x.category !== 'Salat' &&
                        x.restaurant != null &&
                        selectedRestaurants.includes(x.restaurant.toLowerCase())
                )

            todayEntries?.sort((a, b) => userMealRating(b) - userMealRating(a))

            if (todayEntries == null) {
                setFoodEntries([])
            } else {
                const shownEntries = todayEntries.slice(0, 2)
                const hiddenEntriesCount =
                    todayEntries.length - shownEntries.length
                setFoodEntries([
                    ...shownEntries.map((x) => ({
                        name: x.name.en,
                        price: getUserSpecificPrice(x, userKind),
                    })),
                    ...(hiddenEntriesCount > 0
                        ? [
                              {
                                  name:
                                      hiddenEntriesCount === 1
                                          ? 'and 1 more item'
                                          : `and ${hiddenEntriesCount} more items`,
                                  price: null,
                              },
                          ]
                        : []),
                ])
            }
            setLoadingState(LoadingState.LOADED)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <BaseCard
            title={foodCardTitle}
            icon="restaurant"
            onPress={() => {
                router.replace('food')
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                }}
            >
                {loadingState === LoadingState.LOADED && (
                    <View
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        {foodEntries.length === 0 && (
                            <View
                                style={{
                                    paddingBottom: 12,
                                    width: '90%',
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.labelColor,
                                        fontWeight: '500',
                                        fontSize: 16,
                                    }}
                                >
                                    Today&rsquo;s menu is empty.
                                </Text>
                            </View>
                        )}
                        {foodEntries.map((meal, index) => (
                            <>
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        paddingBottom: 12,
                                        paddingTop: index === 0 ? 0 : 12,
                                        width: '90%',
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.text,
                                                fontWeight: '500',
                                                fontSize: 16,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {meal.name}
                                        </Text>
                                        {meal.price != null && (
                                            <Text
                                                style={{
                                                    color: colors.labelColor,
                                                    fontSize: 15,
                                                }}
                                                numberOfLines={1}
                                            >
                                                for {meal.price}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {foodEntries.length - 1 !== index && (
                                    <Divider
                                        color={colors.border}
                                        position="center"
                                        width={'90%'}
                                    />
                                )}
                            </>
                        ))}
                    </View>
                )}
            </View>
        </BaseCard>
    )
}

export default EventsCard
