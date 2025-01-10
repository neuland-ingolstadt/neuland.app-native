// @ts-expect-error - no types available
import DragDropView from '@/components/Exclusive/DragView'
import ContextMenu from '@/components/Flow/ContextMenu'
import PlatformIcon from '@/components/Universal/Icon'
import { UserKindContext } from '@/components/contexts'
import { type UserKindContextType } from '@/contexts/userKind'
import { USER_GUEST } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type LanguageKey } from '@/localization/i18n'
import { type Meal } from '@/types/neuland-api'
import {
    convertRelevantAllergens,
    convertRelevantFlags,
    formatPrice,
    getUserSpecificLabel,
    getUserSpecificPrice,
    humanLocations,
    mealName,
    shareMeal,
} from '@/utils/food-utils'
import { trackEvent } from '@aptabase/react-native'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
}): React.JSX.Element => {
    const preferencesSelection = useFoodFilterStore(
        (state) => state.preferencesSelection
    )
    const allergenSelection = useFoodFilterStore(
        (state) => state.allergenSelection
    )
    const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
    const { t, i18n } = useTranslation('food')
    const { styles, theme } = useStyles(stylesheet)
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
    const setSelectedMeal = useRouteParamsStore(
        (state) => state.setSelectedMeal
    )
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
    const webName = hasUserAllergens ? 'TriangleAlert' : 'Info'
    const textContent = hasUserAllergens
        ? userAllergens
        : t('empty.noAllergens')

    const [key, setKey] = useState(Math.random())

    const itemPressed = (): void => {
        setSelectedMeal(meal)
        router.navigate({
            pathname: '/meal',
        })
    }
    return (
        <DragDropView
            mode="drag"
            scope="system"
            dragValue={t('details.share.message', {
                meal: meal.name[i18n.language as LanguageKey],
                price: formatPrice(meal.prices[userKind ?? 'guest']),
                location:
                    humanLocations[
                        meal.restaurant as keyof typeof humanLocations
                    ],
                id: meal.id,
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
                onPreviewPress={itemPressed}
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
                    onPress={itemPressed}
                    delayLongPress={300}
                    onLongPress={() => {
                        /* nothing */
                    }}
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
                                        theme.colors.labelBackground,
                                        Color(theme.colors.labelBackground)
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
                                    {userFlags.map(
                                        (flag: string, index: number) => (
                                            <LinearGradient
                                                key={index}
                                                style={styles.flagsBox}
                                                colors={[
                                                    theme.colors
                                                        .labelBackground,
                                                    Color(
                                                        theme.colors
                                                            .labelBackground
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
                                            web={{
                                                name: webName,
                                                size: 16,
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
    allergene: {
        color: theme.colors.notification,
        fontSize: 12,
    },
    allergensContainer: {
        alignContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 2,
        marginTop: 6,
        width: '80%',
    },
    container: {
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        padding: theme.margins.card,
        shadowColor: theme.colors.text,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        width: '100%',
    },
    contextMenu: { zIndex: 3 },
    detailsColumns: {
        flexDirection: 'column',
        flex: 1,
        paddingTop: 2,
    },
    detailsContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 3,
    },
    flags: {
        alignContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    flagsBox: {
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.sm,
        flexDirection: 'row',
        marginBottom: 2,
        marginRight: 4,
    },
    flagsText: {
        color: theme.colors.text,
        fontSize: 12,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    icon: {
        alignSelf: 'center',
        color: theme.colors.notification,
        marginRight: 4,
    },
    innerContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    pressable: {
        marginTop: 8,
    },
    price: {
        alignSelf: 'flex-end',
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    priceContainer: {
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    priceLabel: {
        alignSelf: 'flex-end',
        color: theme.colors.labelColor,
        fontSize: 12,
    },
    title: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
        maxWidth: '88%',
    },
    variantContainer: {
        borderRadius: theme.radius.sm,
        maxWidth: '10%',
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    variantText: {
        color: theme.colors.text,
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
}))
