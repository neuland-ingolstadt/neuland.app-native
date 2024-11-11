import { humanLocations, shareMeal } from '@/app/(screens)/meal'
import { FoodFilterContext, UserKindContext } from '@/components/contexts'
import { type UserKindContextType } from '@/contexts/userKind'
import { USER_GUEST } from '@/data/constants'
import { type LanguageKey } from '@/localization/i18n'
import { type Meal } from '@/types/neuland-api'
import {
    convertRelevantAllergens,
    convertRelevantFlags,
    formatPrice,
    getUserSpecificLabel,
    getUserSpecificPrice,
    mealName,
} from '@/utils/food-utils'
import { CARD_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import { Buffer } from 'buffer/'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

// @ts-expect-error - no types available
import DragDropView from '../Exclusive/DragView'
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
    const { styles } = useStyles(stylesheet)
    const userAllergens = convertRelevantAllergens(
        meal.allergens ?? [],
        allergenSelection,
        i18n.language
    )
    const { userKind = USER_GUEST } =
        useContext<UserKindContextType>(UserKindContext)
    const userFlags = convertRelevantFlags(
        meal.flags ?? [],
        preferencesSelection,
        i18n.language
    )

    useEffect(() => {}, [userKind])
    const price = getUserSpecificPrice(meal, userKind ?? 'guest')
    const label =
        price !== '' ? getUserSpecificLabel(userKind ?? 'guest', t) : ''

    const isNotConfigured =
        allergenSelection.length === 1 &&
        allergenSelection[0] === 'not-configured'
    const hasSelectedAllergens =
        allergenSelection.length > 0 && !isNotConfigured
    const hasUserAllergens = userAllergens.length > 0 && !isNotConfigured
    const hasNoMealAllergens = hasSelectedAllergens && meal.allergens === null

    const shouldShowAllergens = hasUserAllergens || hasNoMealAllergens

    const iconName = hasUserAllergens
        ? 'exclamationmark.triangle'
        : 'info.circle'
    const androidName = hasUserAllergens ? 'warning' : 'info'
    const textContent = hasUserAllergens
        ? userAllergens
        : t('empty.noAllergens')

    const [key, setKey] = useState(Math.random())

    return (
        <DragDropView
            mode="drag"
            scope="system"
            dragValue={t('details.share.message', {
                meal: meal?.name[i18n.language as LanguageKey],
                price: formatPrice(meal?.prices[userKind ?? 'guest']),
                location:
                    humanLocations[
                        meal.restaurant as keyof typeof humanLocations
                    ],
                id: meal?.id,
            })}
        >
            <ContextMenu
                title={
                    humanLocations[
                        meal.restaurant as keyof typeof humanLocations
                    ]
                }
                key={key}
                style={styles.contextMenu}
                actions={[
                    {
                        title:
                            meal.allergens?.join(', ') ??
                            t('empty.noAllergens'),
                        subtitle:
                            meal.allergens !== null
                                ? t('preferences.formlist.allergens')
                                : undefined,
                        systemIcon:
                            Platform.OS === 'ios'
                                ? 'exclamationmark.triangle'
                                : undefined,
                        disabled: true,
                    },
                    {
                        title: t('misc.share', { ns: 'common' }),
                        systemIcon:
                            Platform.OS === 'ios'
                                ? 'square.and.arrow.up'
                                : undefined,
                    },
                ]}
                onPreviewPress={() => {
                    const base64Event = Buffer.from(
                        JSON.stringify(meal)
                    ).toString('base64')
                    router.push({
                        pathname: 'meal',
                        params: {
                            foodEntry: base64Event,
                        },
                    })
                }}
                onPress={(e) => {
                    if (
                        e.nativeEvent.name === t('misc.share', { ns: 'common' })
                    ) {
                        trackEvent('Share', {
                            type: 'meal',
                        })
                        shareMeal(meal, i18n, userKind)
                    }
                    setKey(Math.random())
                }}
            >
                <Pressable
                    onPress={() => {
                        const base64Event = Buffer.from(
                            JSON.stringify(meal)
                        ).toString('base64')
                        router.push({
                            pathname: 'meal',
                            params: {
                                foodEntry: base64Event,
                            },
                        })
                    }}
                    delayLongPress={300}
                    onLongPress={() => {}}
                    style={styles.pressable}
                >
                    <View key={index} style={styles.container}>
                        <View style={styles.innerContainer}>
                            <Text
                                style={styles.title}
                                adjustsFontSizeToFit={true}
                                numberOfLines={2}
                            >
                                {mealName(
                                    meal.name,
                                    foodLanguage,
                                    i18n.language as LanguageKey
                                )}
                            </Text>
                            {meal.variants?.length > 0 && (
                                <LinearGradient
                                    style={styles.variantContainer}
                                    colors={[
                                        styles.labelBackground.color,
                                        Color(styles.labelBackground.color)
                                            .lighten(0.15)
                                            .hex(),
                                    ]}
                                    start={[0, 1]}
                                    end={[1, 0]}
                                >
                                    <Text style={styles.variantText}>
                                        {'+ ' + meal.variants.length}
                                    </Text>
                                </LinearGradient>
                            )}
                        </View>
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailsColumns}>
                                <View style={styles.flags}>
                                    {userFlags?.map(
                                        (flag: string, index: number) => (
                                            <LinearGradient
                                                key={index}
                                                style={styles.flagsBox}
                                                colors={[
                                                    styles.labelBackground
                                                        .color,
                                                    Color(
                                                        styles.labelBackground
                                                            .color
                                                    )
                                                        .lighten(0.13)
                                                        .hex(),
                                                ]}
                                                start={[0, 0]}
                                                end={[1, 0]}
                                            >
                                                <Text style={styles.flagsText}>
                                                    {flag}
                                                </Text>
                                            </LinearGradient>
                                        )
                                    )}
                                </View>
                                {shouldShowAllergens && (
                                    <View style={styles.allergensContainer}>
                                        <PlatformIcon
                                            ios={{
                                                name: iconName,
                                                size: 13,
                                            }}
                                            android={{
                                                name: androidName,
                                                size: 16,
                                                variant: 'outlined',
                                            }}
                                            style={styles.icon}
                                        />
                                        <Text
                                            style={styles.allergene}
                                            numberOfLines={3}
                                        >
                                            {textContent}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>
                                    {getUserSpecificPrice(
                                        meal,
                                        userKind ?? 'guest'
                                    )}
                                </Text>
                                {label !== '' && (
                                    <Text style={styles.priceLabel}>
                                        {label}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </Pressable>
            </ContextMenu>
        </DragDropView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
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
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.text,
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    contextMenu: { zIndex: 3 },
    title: {
        fontWeight: '500',
        fontSize: 16,
        maxWidth: '88%',
        color: theme.colors.text,
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
        color: theme.colors.text,
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
        color: theme.colors.text,
    },
    priceLabel: {
        fontSize: 12,
        alignSelf: 'flex-end',
        color: theme.colors.labelColor,
    },
    pressable: {
        marginTop: 8,
    },
    icon: {
        marginRight: 4,
        alignSelf: 'center',
        color: theme.colors.notification,
    },
    allergene: {
        fontSize: 12,
        color: theme.colors.notification,
    },
    variantContainer: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        maxWidth: '10%',
    },
    variantText: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        textAlignVertical: 'center',
        color: theme.colors.text,
    },
    labelBackground: {
        color: theme.colors.labelBackground,
    },
}))
