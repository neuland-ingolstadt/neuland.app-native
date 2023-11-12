import FormList from '@/components/Elements/Universal/FormList'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import allergenMap from '@/data/allergens.json'
import flagMap from '@/data/mensa-flags.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { type UserKindContextType } from '@/stores/hooks/userKind'
import { FoodFilterContext, UserKindContext } from '@/stores/provider'
import { type FormListSections } from '@/stores/types/components'
import { type Meal } from '@/stores/types/neuland-api'
import { formatPrice, mealName } from '@/utils/food-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
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
    const { preferencesSelection, allergenSelection, foodLanguage } =
        useContext(FoodFilterContext)
    const { t, i18n } = useTranslation('food')
    const { userKind } = useContext<UserKindContextType>(UserKindContext)

    const dataSources = {
        Mensa: 'https://www.werkswelt.de/?id=ingo',
        Reimanns: 'http://reimanns.in/mittagsgerichte-wochenkarte/',
        Canisius: 'http://www.canisiusstiftung.de/upload/speiseplan.pdf',
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
                        ? 'shield-checkmark-outline'
                        : undefined,
                    iconColor: colors.primary,
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
                            ? 'warning-outline'
                            : undefined,
                        iconColor: colors.notification,
                    })) ?? [],
        },
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

    const aboutSection: FormListSections[] = [
        {
            header: t('details.formlist.about.title'),
            items: [
                {
                    title: 'Restaurant',
                    value: meal?.restaurant,
                },
                {
                    title: t('details.formlist.about.category'),
                    value: meal?.category,
                },
                {
                    title: t('details.formlist.about.source'),
                    icon: 'chevron-forward-outline',
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
            header: t('details.formlist.variations'),
            items:
                meal?.variations?.map((variant) => ({
                    title: variant.name[i18n.language as LanguageKey],
                    value:
                        (variant.additional ? '+ ' : '') +
                        formatPrice(variant.prices[userKind]),
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
                  ...mensaSection,
                  ...variantsSection,
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
                        await Share.share({
                            message: t('details.share.message', {
                                meal: meal?.name[i18n.language as LanguageKey],
                                price: formatPrice(meal?.prices[userKind]),
                                location: meal?.restaurant,
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
        paddingHorizontal: 16,
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
