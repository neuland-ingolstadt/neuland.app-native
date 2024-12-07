import ErrorView from '@/components/Error/ErrorView'
import FormList from '@/components/Universal/FormList'
import PlatformIcon, { linkIcon } from '@/components/Universal/Icon'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import { FoodFilterContext, UserKindContext } from '@/components/contexts'
import allergenMap from '@/data/allergens.json'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import flagMap from '@/data/mensa-flags.json'
import { type LanguageKey } from '@/localization/i18n'
import { type FormListSections } from '@/types/components'
import { type Meal } from '@/types/neuland-api'
import {
    formatPrice,
    humanLocations,
    mealName,
    shareMeal,
} from '@/utils/food-utils'
import { trackEvent } from '@aptabase/react-native'
import { router, useFocusEffect, useNavigation } from 'expo-router'
import React, { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, ScrollView, Share, Text, View } from 'react-native'
import { useMMKVObject } from 'react-native-mmkv'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function FoodDetail(): JSX.Element {
    const [selectedMeal] = useMMKVObject('selectedMeal', undefined)
    const { styles, theme } = useStyles(stylesheet)
    const meal = selectedMeal as Meal | undefined
    const {
        preferencesSelection,
        allergenSelection,
        foodLanguage,
        toggleSelectedAllergens,
        toggleSelectedPreferences,
    } = useContext(FoodFilterContext)
    const { t, i18n } = useTranslation('food')
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const navigation = useNavigation()
    const dataSources = {
        IngolstadtMensa: 'https://www.werkswelt.de/?id=ingo',
        NeuburgMensa: 'https://www.werkswelt.de/?id=mtneuburg',
        Reimanns: 'http://reimanns.in/mittagsgerichte-wochenkarte/',
        Canisius: 'http://www.canisiusstiftung.de/upload/speiseplan.pdf',
    }

    useFocusEffect(
        useCallback(() => {
            if (meal === undefined) {
                navigation.setOptions({
                    headerRight: () => undefined,
                })
            } else {
                navigation.setOptions({
                    headerRight: () => (
                        <ShareHeaderButton
                            onPress={() => {
                                shareMeal(meal, i18n, userKind)
                            }}
                        />
                    ),
                })
            }
        }, [])
    )

    if (meal === undefined) {
        return (
            <ErrorView
                title={t('details.error.title')}
                message={t('details.error.message')}
            />
        )
    }

    interface Locations {
        IngolstadtMensa: string
        Reimanns: string
        Canisius: string
        [key: string]: string
    }

    const locations: Locations = {
        IngolstadtMensa: 'M001',
        Reimanns: 'F001',
        Canisius: 'X001',
    }

    function itemAlert(item: string, itemType: 'allergen' | 'flag'): void {
        const itemMap = itemType === 'allergen' ? allergenMap : flagMap
        const friendlyItem =
            itemMap[item as keyof typeof itemMap]?.[
                i18n.language as LanguageKey
            ] ?? item
        const isItemSelected = (
            itemType === 'allergen' ? allergenSelection : preferencesSelection
        ).includes(item)

        Alert.alert(
            t(`details.formlist.alert.${itemType}.title`),
            isItemSelected
                ? t(
                      // @ts-expect-error cannot verify the TFunktion type
                      `details.formlist.alert.${itemType}.message.remove`,
                      {
                          [itemType]: friendlyItem,
                      }
                  )
                : t(
                      // @ts-expect-error cannot verify the TFunktion type
                      `details.formlist.alert.${itemType}.message.add`,
                      {
                          [itemType]: friendlyItem,
                      }
                  ),
            [
                {
                    text: t('misc.confirm', { ns: 'common' }),
                    onPress: () => {
                        if (itemType === 'allergen') {
                            toggleSelectedAllergens(item)
                        } else if (itemType === 'flag') {
                            toggleSelectedPreferences(item)
                        }
                    },
                },
                {
                    text: t('misc.cancel', { ns: 'common' }),
                    onPress: () => {},
                    style: 'cancel',
                },
            ]
        )
    }

    const studentPrice = formatPrice(meal?.prices?.student)
    const employeePrice = formatPrice(meal?.prices?.employee)
    const guestPrice = formatPrice(meal?.prices?.guest)
    const isPriceAvailable =
        studentPrice !== '' && employeePrice !== '' && guestPrice !== ''
    const priceSection: FormListSections[] = isPriceAvailable
        ? [
              {
                  header: t('details.formlist.prices.title'),
                  items: [
                      {
                          title: t('details.formlist.prices.student'),
                          value: studentPrice,
                          fontWeight:
                              userKind === USER_STUDENT ? '600' : 'normal',
                      },
                      {
                          title: t('details.formlist.prices.employee'),
                          value: employeePrice,
                          fontWeight:
                              userKind === USER_EMPLOYEE ? '600' : 'normal',
                      },
                      {
                          title: t('details.formlist.prices.guest'),
                          value: guestPrice,
                          fontWeight:
                              userKind === USER_GUEST ? '600' : 'normal',
                      },
                  ],
              },
          ]
        : []

    const isNutritionAvailable =
        meal?.nutrition != null &&
        Object.values(meal.nutrition).every(
            (value) => value !== '' && value !== 0
        )

    const nutritionSection: FormListSections[] = [
        {
            header: t('details.formlist.nutrition.title'),
            footer: t('details.formlist.nutrition.footer'),
            items: [
                {
                    title: t('details.formlist.nutrition.energy'),
                    value:
                        (meal?.nutrition?.kj ?? 'n/a').toString() +
                        ' kJ / ' +
                        (meal?.nutrition?.kcal ?? 'n/a').toString() +
                        ' kcal',
                },

                {
                    title: t('details.formlist.nutrition.fat'),
                    value: (meal?.nutrition?.fat ?? 'n/a').toString() + ' g',
                },
                {
                    title: t('details.formlist.nutrition.saturated'),
                    value:
                        (meal?.nutrition?.fatSaturated ?? 'n/a').toString() +
                        ' g',
                },
                {
                    title: t('details.formlist.nutrition.carbs'),
                    value: (meal?.nutrition?.carbs ?? 'n/a').toString() + ' g',
                },
                {
                    title: t('details.formlist.nutrition.sugar'),
                    value: (meal?.nutrition?.sugar ?? 'n/a').toString() + ' g',
                },
                {
                    title: t('details.formlist.nutrition.fiber'),
                    value: (meal?.nutrition?.fiber ?? 'n/a').toString() + ' g',
                },
                {
                    title: t('details.formlist.nutrition.protein'),
                    value:
                        (meal?.nutrition?.protein ?? 'n/a').toString() + ' g',
                },
                {
                    title: t('details.formlist.nutrition.salt'),
                    value: (meal?.nutrition?.salt ?? 'n/a').toString() + ' g',
                },
            ],
        },
    ]
    const mensaSection: FormListSections[] = [
        {
            header: t('preferences.formlist.flags'),
            items:
                meal?.flags?.map((flag: string) => ({
                    title:
                        flagMap[flag as keyof typeof flagMap]?.[
                            i18n.language as LanguageKey
                        ] ?? flag,
                    icon: preferencesSelection.includes(flag)
                        ? {
                              android: 'check_circle',
                              ios: 'checkmark.seal',
                          }
                        : undefined,
                    iconColor: theme.colors.success,
                    onPress: () => {
                        itemAlert(flag, 'flag')
                    },
                })) ?? [],
            footer: t('details.formlist.flagsFooter'),
        },
        {
            header: t('preferences.formlist.allergens'),
            items:
                (meal?.allergens ?? [])
                    .filter((allergen: string) =>
                        Object.keys(allergenMap).includes(allergen)
                    )
                    .map((allergen: string) => ({
                        title:
                            allergenMap[allergen as keyof typeof allergenMap]?.[
                                i18n.language as LanguageKey
                            ] ?? allergen,
                        icon: allergenSelection.includes(allergen)
                            ? {
                                  android: 'warning',
                                  ios: 'exclamationmark.triangle',
                              }
                            : undefined,
                        iconColor: theme.colors.notification,
                        onPress: () => {
                            itemAlert(allergen, 'allergen')
                        },
                    })) ?? [],
            footer: t('details.formlist.allergenFooter', {
                allergens: meal?.allergens?.join(', '),
            }),
        },
        ...(isNutritionAvailable ? nutritionSection : []),
    ]

    const restaurant =
        meal?.restaurant != null
            ? meal.restaurant.charAt(0).toUpperCase() + meal.restaurant.slice(1)
            : ''
    const handlePress = (): void => {
        const location = locations[restaurant as keyof typeof locations]

        if (restaurant != null && location !== undefined) {
            router.dismissTo({
                pathname: '/(tabs)/map',
                params: { room: location },
            })
        }
    }

    const locationExists =
        restaurant !== undefined && locations[restaurant] !== undefined

    const aboutSection: FormListSections[] = [
        {
            header: t('details.formlist.about.title'),
            items: [
                {
                    title: 'Restaurant',
                    value: humanLocations[
                        restaurant as keyof typeof humanLocations
                    ],
                    onPress: handlePress,
                    textColor: locationExists
                        ? theme.colors.primary
                        : undefined,
                    disabled: !locationExists,
                },
                {
                    title: t('details.formlist.about.category'),
                    value: t(
                        // @ts-expect-error cannot verify the TFunktion type
                        `categories.${meal?.category}`
                    ),
                },
                {
                    title: t('details.formlist.about.source'),
                    icon: linkIcon,
                    onPress: () => {
                        if (meal?.restaurant !== null) {
                            const restaurant =
                                meal?.restaurant as keyof typeof dataSources
                            void Linking.openURL(dataSources[restaurant])
                        }
                    },
                },
            ],
        },
    ]

    const variantsSection: FormListSections[] = [
        {
            header: t('details.formlist.variants'),
            items:
                meal?.variants?.map((variant) => ({
                    title: variant.name[i18n.language as LanguageKey],
                    value:
                        (variant?.additional ? '+ ' : '') +
                        formatPrice(variant.prices[userKind ?? USER_GUEST]),
                    onPress: () => {
                        trackEvent('Share', {
                            type: 'mealVariant',
                        })
                        void Share.share({
                            message: t('details.share.message', {
                                meal: variant.name[
                                    i18n.language as LanguageKey
                                ],
                                price: formatPrice(
                                    variant.prices[userKind ?? USER_GUEST]
                                ),
                                location: restaurant,
                                id: variant?.id,
                            }),
                        })
                    },
                })) ?? [],
        },
    ]

    const isTranslated = (): boolean => {
        if (foodLanguage !== 'default') {
            return foodLanguage === 'de'
        } else {
            return i18n.language === 'de'
        }
    }

    const sections: FormListSections[] =
        meal?.restaurant === 'IngolstadtMensa' ||
        meal?.restaurant === 'NeuburgMensa'
            ? [
                  ...priceSection,
                  ...variantsSection,
                  ...mensaSection,
                  ...aboutSection,
              ]
            : [...priceSection, ...variantsSection, ...aboutSection]

    return (
        <>
            <ScrollView>
                <View style={styles.titleContainer}>
                    <Text
                        style={styles.titleText}
                        allowFontScaling={true}
                        adjustsFontSizeToFit={true}
                        numberOfLines={2}
                        selectable={true}
                    >
                        {meal != null &&
                            mealName(
                                meal.name,
                                foodLanguage,
                                i18n.language as LanguageKey
                            )}
                    </Text>
                </View>
                <View style={styles.formList}>
                    <FormList sections={sections} />
                </View>

                <View style={styles.notesContainer}>
                    <View style={styles.notesBox}>
                        <PlatformIcon
                            ios={{
                                name: 'exclamationmark.triangle',
                                variant: 'fill',
                                size: 21,
                            }}
                            android={{
                                name: 'warning',
                                size: 24,
                            }}
                            style={styles.iconWarning}
                        />
                        <Text style={styles.notesText}>
                            {!isTranslated() ? t('details.translated') : ''}
                            {t('details.footer')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    formList: {
        alignSelf: 'center',
        marginVertical: 16,
        paddingHorizontal: theme.margins.page,
        width: '100%',
    },
    iconWarning: {
        color: theme.colors.warning,
    },
    notesBox: {
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        width: '100%',
    },
    notesContainer: {
        alignSelf: 'center',
        marginBottom: theme.margins.bottomSafeArea,
        marginTop: 20,
        paddingHorizontal: theme.margins.page,
    },
    notesText: {
        color: theme.colors.labelColor,
        flex: 1,
        flexShrink: 1,
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
    },
    titleContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        marginTop: 20,
        paddingHorizontal: 5,
        paddingVertical: 10,
        width: '92%',
    },
    titleText: {
        color: theme.colors.text,
        fontSize: 18,
        textAlign: 'center',
    },
}))
