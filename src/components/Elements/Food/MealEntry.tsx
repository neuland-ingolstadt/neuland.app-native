import { type Colors } from '@/components/colors'
import { FoodFilterContext, UserKindContext } from '@/components/provider'
import { type LanguageKey } from '@/localization/i18n'
import { type Meal } from '@/types/neuland-api'
import {
    convertRelevantAllergens,
    convertRelevantFlags,
    getUserSpecificLabel,
    getUserSpecificPrice,
    mealName,
} from '@/utils/food-utils'
import { CARD_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

/**
 * Renders a single meal entry in the food menu.
 * @param meal - The meal object to render.
 * @param index - The index of the meal in the list.
 * @returns A JSX element representing the meal entry.
 */
export const MealEntry = ({
    meal,
    index,
}: {
    meal: Meal
    index: number
}): JSX.Element => {
    const { preferencesSelection, allergenSelection, foodLanguage } =
        useContext(FoodFilterContext)
    const { t, i18n } = useTranslation('food')
    const userAllergens = convertRelevantAllergens(
        meal.allergens ?? [],
        allergenSelection,
        i18n.language
    )
    const colors = useTheme().colors as Colors
    const { userKind } = useContext(UserKindContext)
    const userFlags = convertRelevantFlags(
        meal.flags ?? [],
        preferencesSelection,
        i18n.language
    )

    useEffect(() => {}, [userKind])
    const price = getUserSpecificPrice(meal, userKind)
    const label =
        price !== '' ? getUserSpecificLabel(userKind, t) : t('price.unknown')

    const isNotConfigured =
        allergenSelection.length === 1 &&
        allergenSelection[0] === 'not-configured'

    const hasUserAllergens = !isNotConfigured && userAllergens.length !== 0
    const hasNoMealAllergens = !isNotConfigured && meal.allergens === null

    const iconName = hasUserAllergens
        ? 'exclamationmark.triangle'
        : 'info.circle'
    const androidName = hasUserAllergens ? 'warning' : 'check'
    const textContent = hasUserAllergens
        ? userAllergens
        : t('empty.noAllergens')

    return (
        <Pressable
            onPress={() => {
                router.push({
                    pathname: '(food)/details',
                    params: { foodEntry: JSON.stringify(meal) },
                })
            }}
            style={styles.pressable}
        >
            <View
                key={index}
                style={[
                    styles.container,
                    {
                        backgroundColor: colors.card,
                        shadowColor: colors.text,
                    },
                ]}
            >
                <Text
                    style={[styles.Title, { color: colors.text }]}
                    adjustsFontSizeToFit={true}
                    numberOfLines={2}
                >
                    {mealName(
                        meal.name,
                        foodLanguage,
                        i18n.language as LanguageKey
                    )}
                </Text>
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsColumns}>
                        <View style={styles.flags}>
                            {userFlags?.map((flag: string, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.flagsBox,
                                        {
                                            backgroundColor:
                                                colors.labelBackground,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.flagsText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {flag}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        {(hasUserAllergens || hasNoMealAllergens) && (
                            <View style={styles.allergensContainer}>
                                <PlatformIcon
                                    ios={{
                                        name: iconName,
                                        size: 13,
                                    }}
                                    android={{
                                        name: androidName,
                                        size: 16,
                                    }}
                                    style={styles.icon}
                                    color={colors.notification}
                                />
                                <Text
                                    style={[
                                        styles.allergene,
                                        {
                                            color: colors.notification,
                                        },
                                    ]}
                                    numberOfLines={3}
                                >
                                    {textContent}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: colors.text }]}>
                            {getUserSpecificPrice(meal, userKind)}
                        </Text>
                        <Text
                            style={[
                                styles.priceLabel,
                                { color: colors.labelColor },
                            ]}
                        >
                            {label}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: CARD_PADDING,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    Title: {
        fontWeight: '500',
        fontSize: 16,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 3,
    },
    detailsColumns: {
        flexDirection: 'column',
        flex: 1,
        paddingTop: 2,
    },
    flags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'center',
    },
    flagsBox: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        marginRight: 4,
        marginBottom: 2,
    },
    flagsText: {
        fontSize: 12,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    allergensContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        width: '80%',
        gap: 2,
    },
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
    },
    price: {
        fontSize: 14,
        fontWeight: '500',
        alignSelf: 'flex-end',
    },
    priceLabel: {
        fontSize: 12,
        alignSelf: 'flex-end',
    },
    pressable: {
        marginTop: 8,
    },
    icon: {
        marginRight: 4,
        alignSelf: 'center',
    },
    allergene: {
        fontSize: 12,
    },
})
