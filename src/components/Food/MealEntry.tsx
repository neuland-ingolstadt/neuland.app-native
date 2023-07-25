import { type Colors, FoodFilterContext } from '@/stores/provider'
import {
    convertRelevantAllergens,
    convertRelevantFlags,
    formatPrice,
} from '@/utils/food-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

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
    meal: any
    index: number
}): JSX.Element => {
    const { preferencesSelection, allergenSelection } =
        useContext(FoodFilterContext)
    const userAllergens = convertRelevantAllergens(
        meal.allergens,
        allergenSelection
    )
    const colors = useTheme().colors as Colors
    const userFlags = convertRelevantFlags(meal.flags, preferencesSelection)

    return (
        <Pressable
            onPress={() => {
                router.push({
                    pathname: '(food)/details',
                    params: { foodEntry: JSON.stringify(meal) },
                })
            }}
            style={{ marginTop: 8 }}
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
                    {meal.name.en}
                </Text>
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsColumns}>
                        <View style={styles.falgs}>
                            {userFlags?.map((flag: string, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.falgsBox,
                                        {
                                            backgroundColor:
                                                colors.labelBackground,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.falgsText,
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
                        {userAllergens?.length > 0 && (
                            <View style={styles.allergensContainer}>
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
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: colors.text }]}>
                            {formatPrice(meal.prices.student)}
                        </Text>
                        <Text
                            style={[
                                styles.priceLabel,
                                { color: colors.labelColor },
                            ]}
                        >
                            for students
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
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
    },
    Title: {
        fontWeight: '600',
        fontSize: 16,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',

        paddingTop: 4,
    },
    detailsColumns: {
        flexDirection: 'column',
        flex: 1,
        paddingTop: 2,
    },
    falgs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'center',
    },
    falgsBox: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 4,

        marginRight: 4,
        marginBottom: 2,
    },
    falgsText: {
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
    },
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        paddingRight: 4,
        marginRight: 4,
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
})
