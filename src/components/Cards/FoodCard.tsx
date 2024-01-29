import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { FoodFilterContext, UserKindContext } from '@/components/provider'
import { type LanguageKey } from '@/localization/i18n'
import { type Meal } from '@/types/neuland-api'
import { formatISODate } from '@/utils/date-utils'
import {
    getUserSpecificPrice,
    loadFoodEntries,
    mealName,
    userMealRating,
} from '@/utils/food-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const FoodCard = (): JSX.Element => {
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const { t, i18n } = useTranslation('food')

    const router = useRouter()
    const colors = useTheme().colors as Colors
    const {
        selectedRestaurants,
        allergenSelection,
        preferencesSelection,
        foodLanguage,
    } = useContext(FoodFilterContext)
    const { userKind } = useContext(UserKindContext)
    const [foodEntries, setFoodEntries] = useState<
        Array<{ name: string; price: string | null }>
    >([])
    const [foodCardTitle, setFoodCardTitle] = useState('Essen')
    const [todayEntries, setTodayEntries] = useState<Meal[]>([])

    useEffect(() => {
        void loadData()
    }, [selectedRestaurants])

    useEffect(() => {
        // Calculate userMealRating and update foodEntries
        const updateFoodEntries = (): void => {
            if (todayEntries == null) {
                setFoodEntries([])
            } else {
                todayEntries?.sort(
                    (a, b) =>
                        userMealRating(
                            b,
                            allergenSelection,
                            preferencesSelection
                        ) -
                        userMealRating(
                            a,
                            allergenSelection,
                            preferencesSelection
                        )
                )
                const shownEntries = todayEntries.slice(0, 2)
                const hiddenEntriesCount =
                    todayEntries.length - shownEntries.length
                setFoodEntries([
                    ...shownEntries.map((x) => ({
                        name: mealName(
                            x.name,
                            foodLanguage,
                            i18n.language as LanguageKey
                        ),
                        price: getUserSpecificPrice(x, userKind),
                    })),
                    ...(hiddenEntriesCount > 0
                        ? [
                              {
                                  name:
                                      hiddenEntriesCount === 1
                                          ? t('dashboard.oneMore')
                                          : t('dashboard.manyMore', {
                                                count: hiddenEntriesCount,
                                            }),
                                  price: null,
                              },
                          ]
                        : []),
                ])
            }
            setLoadingState(LoadingState.LOADED)
        }

        updateFoodEntries()
    }, [
        allergenSelection,
        preferencesSelection,
        todayEntries,
        foodLanguage,
        i18n.language,
        userKind,
    ])

    const loadData = async (): Promise<void> => {
        const restaurants =
            selectedRestaurants.length === 0 ? ['food'] : selectedRestaurants

        if (restaurants.length !== 1) {
            setFoodCardTitle('food')
        } else {
            switch (restaurants[0]) {
                case 'mensa':
                    setFoodCardTitle('mensa')
                    break
                case 'reimanns':
                    setFoodCardTitle('reimanns')
                    break
                case 'canisius':
                    setFoodCardTitle('canisius')
                    break
                default:
                    setFoodCardTitle('food')
                    break
            }
        }

        const today = formatISODate(new Date())

        try {
            const entries = await loadFoodEntries(restaurants, true)
            const todayEntries = entries
                .find((x) => x.timestamp === today)
                ?.meals.filter(
                    (x) =>
                        x.category !== 'soup' &&
                        x.category !== 'salad' &&
                        x.restaurant != null &&
                        selectedRestaurants.includes(x.restaurant.toLowerCase())
                )
            setTodayEntries(todayEntries ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <BaseCard
            title={foodCardTitle}
            iosIcon="fork.knife"
            androidIcon="restaurant"
            onPress={() => {
                router.replace('food')
            }}
        >
            {loadingState === LoadingState.LOADED && (
                <View style={styles.listView}>
                    {foodEntries.length === 0 && (
                        <Text
                            style={[
                                styles.emptyMenu,
                                { color: colors.labelColor },
                            ]}
                        >
                            {t('dashboard.empty')}
                        </Text>
                    )}
                    {foodEntries.map((meal, index) => (
                        <React.Fragment key={index}>
                            <View style={styles.mealEntry}>
                                <Text
                                    style={[
                                        styles.mealTitle,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {meal.name}
                                </Text>
                                {meal.price != null && (
                                    <Text
                                        style={[
                                            styles.mealPrice,
                                            { color: colors.labelColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {meal.price}
                                    </Text>
                                )}
                            </View>
                            {foodEntries.length - 1 !== index && (
                                <Divider color={colors.border} width={'100%'} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </BaseCard>
    )
}

const styles = StyleSheet.create({
    listView: {
        gap: 8,
        paddingTop: 12,
    },
    mealTitle: {
        fontWeight: '500',
        fontSize: 16,
        flexGrow: 1,
        flexShrink: 1,
    },
    mealPrice: {
        fontSize: 15,
    },
    mealEntry: {
        flexDirection: 'row',
        gap: 12,
    },
    emptyMenu: {
        fontWeight: '500',
        fontSize: 16,
    },
})

export default FoodCard
