import FormList from '@/components/Elements/Universal/FormList'
import { chevronIcon } from '@/components/Elements/Universal/Icon'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import { type Colors } from '@/components/colors'
import {
    FoodFilterContext,
    RouteParamsContext,
    UserKindContext,
} from '@/components/provider'
import allergenMap from '@/data/allergens.json'
import flagMap from '@/data/mensa-flags.json'
import { type UserKindContextType } from '@/hooks/contexts/userKind'
import { type LanguageKey } from '@/localization/i18n'
import { type FormListSections } from '@/types/components'
import { type Meal } from '@/types/neuland-api'
import { formatPrice, mealName } from '@/utils/food-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function FoodDetail(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { foodEntry } = useLocalSearchParams<{ foodEntry: string }>()
    const meal: Meal | undefined =
        foodEntry != null ? JSON.parse(foodEntry) : undefined
    const {
        preferencesSelection,
        allergenSelection,
        foodLanguage,
        toggleSelectedAllergens,
        toggleSelectedPreferences,
    } = useContext(FoodFilterContext)
    const { t, i18n } = useTranslation('food')
    const { userKind } = useContext<UserKindContextType>(UserKindContext)
    const { updateRouteParams } = useContext(RouteParamsContext)

    const dataSources = {
        Mensa: 'https://www.werkswelt.de/?id=ingo',
        Reimanns: 'http://reimanns.in/mittagsgerichte-wochenkarte/',
        Canisius: 'http://www.canisiusstiftung.de/upload/speiseplan.pdf',
    }

    interface Locations {
        Mensa: string
        Reimanns: string
        [key: string]: string
    }

    const locations: Locations = {
        Mensa: 'M001',
        Reimanns: 'F001',
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

    const priceSection: FormListSections[] =
        meal != null
            ? [
                  {
                      header: t('details.formlist.prices.title'),
                      items: [
                          {
                              title: t('details.formlist.prices.student'),
                              value: formatPrice(meal.prices?.student),
                          },
                          {
                              title: t('details.formlist.prices.employee'),
                              value: formatPrice(meal.prices?.employee),
                          },
                          {
                              title: t('details.formlist.prices.guest'),
                              value: formatPrice(meal.prices?.guest),
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
                              android: 'check-circle',
                              ios: 'checkmark.seal',
                          }
                        : undefined,
                    iconColor: colors.success,
                    onPress: () => {
                        itemAlert(flag, 'flag')
                    },
                })) ?? [],
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
                        iconColor: colors.notification,
                        onPress: () => {
                            itemAlert(allergen, 'allergen')
                        },
                    })) ?? [],
        },
        ...(isNutritionAvailable ? nutritionSection : []),
    ]

    const handlePress = (): void => {
        const restaurant = meal?.restaurant
        const location = locations[restaurant as keyof typeof locations]

        if (restaurant != null && location !== '') {
            router.navigate('(tabs)/map')
            updateRouteParams(location)
        }
    }

    const restaurant = meal?.restaurant
    const locationExists =
        restaurant !== undefined && locations[restaurant] !== undefined

    const aboutSection: FormListSections[] = [
        {
            header: t('details.formlist.about.title'),
            items: [
                {
                    title: 'Restaurant',
                    value: meal?.restaurant,
                    onPress: handlePress,
                    iconColor: locationExists ? colors.primary : undefined,
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
                    icon: chevronIcon,
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
                        formatPrice(variant.prices[userKind]),
                    onPress: () => {
                        trackEvent('Share', {
                            type: 'meal-variant',
                        })
                        void Share.share({
                            message: t('details.share.message', {
                                meal: variant.name[
                                    i18n.language as LanguageKey
                                ],
                                price: formatPrice(variant.prices[userKind]),
                                location: meal?.restaurant,
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
        meal?.restaurant === 'Mensa'
            ? [
                  ...priceSection,
                  ...variantsSection,
                  ...mensaSection,
                  ...aboutSection,
              ]
            : [...priceSection, ...variantsSection, ...aboutSection]
    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <ScrollView>
                <View
                    style={[
                        styles.titleContainer,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text
                        style={[styles.titleText, { color: colors.text }]}
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
                <ShareButton
                    onPress={async () => {
                        trackEvent('Share', {
                            type: 'meal',
                        })
                        await Share.share({
                            message: t('details.share.message', {
                                meal: meal?.name[i18n.language as LanguageKey],
                                price: formatPrice(meal?.prices[userKind]),
                                location: meal?.restaurant,
                                id: meal?.id,
                            }),
                        })
                    }}
                />
                <View style={styles.notesContainer}>
                    <Text
                        style={[styles.notesText, { color: colors.labelColor }]}
                    >
                        {!isTranslated() ? t('details.translated') : ''}
                        {t('details.footer')}
                    </Text>
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    formList: {
        marginVertical: 16,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: PAGE_PADDING,
    },
    titleContainer: {
        alignSelf: 'center',
        width: '92%',
        marginTop: 20,
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        textAlign: 'center',
    },
    notesContainer: {
        alignSelf: 'center',
        width: '92%',
        marginTop: 20,
        marginBottom: 40,
    },
    notesText: {
        textAlign: 'left',
        fontSize: 12,
    },
})
