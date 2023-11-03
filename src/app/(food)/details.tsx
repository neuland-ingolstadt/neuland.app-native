import allergenMap from '@/assets/data/allergens.json'
import flagMap from '@/assets/data/mensa-flags.json'
import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { type UserKindContextType } from '@/stores/hooks/userKind'
import { FoodFilterContext, UserKindContext } from '@/stores/provider'
import { type FormListSections } from '@/stores/types/components'
import { type Meal } from '@/stores/types/neuland-api'
import { formatPrice } from '@/utils/food-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import {
    Linking,
    Pressable,
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
    const { preferencesSelection, allergenSelection } =
        useContext(FoodFilterContext)

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
                      header: 'Prices',
                      items: [
                          {
                              title: 'Student',
                              value: formatPrice(meal.prices?.student),
                              disabled: true,
                          },
                          {
                              title: 'Employee',
                              value: formatPrice(meal.prices?.employee),
                              disabled: true,
                          },
                          {
                              title: 'Guest',
                              value: formatPrice(meal.prices?.guest),
                              disabled: true,
                          },
                      ],
                  },
              ]
            : []

    const mensaSection: FormListSections[] = [
        {
            header: 'Flags',
            items:
                meal?.flags?.map((flag: string) => ({
                    title: flagMap[flag as keyof typeof flagMap]?.en ?? flag,
                    disabled: true,
                    icon: preferencesSelection.includes(flag)
                        ? 'shield-checkmark-outline'
                        : undefined,
                    iconColor: colors.primary,
                })) ?? [],
        },
        {
            header: 'Allergens',
            items:
                (meal?.allergens ?? [])
                    .filter((allergen: string) =>
                        Object.keys(allergenMap).includes(allergen)
                    )
                    .map((allergen: string) => ({
                        title:
                            allergenMap[allergen as keyof typeof allergenMap]
                                ?.en ?? allergen,
                        disabled: true,
                        icon: allergenSelection.includes(allergen)
                            ? 'warning-outline'
                            : undefined,
                        iconColor: colors.notification,
                    })) ?? [],
        },
        {
            header: 'Nutrition',
            footer: 'Values are per meal and may vary',
            items: [
                {
                    title: 'Energy',
                    value:
                        (meal?.nutrition?.kj ?? 'n/a').toString() +
                        ' kJ / ' +
                        (meal?.nutrition?.kcal ?? 'n/a').toString() +
                        ' kcal',
                    disabled: true,
                },

                {
                    title: 'Fat',
                    value: (meal?.nutrition?.fat ?? 'n/a').toString() + ' g',
                    disabled: true,
                },
                {
                    title: 'Saturated Fat',
                    value:
                        (meal?.nutrition?.fatSaturated ?? 'n/a').toString() +
                        ' g',
                    disabled: true,
                },
                {
                    title: 'Carbohydrates',
                    value: (meal?.nutrition?.carbs ?? 'n/a').toString() + ' g',
                    disabled: true,
                },
                {
                    title: 'Sugar',
                    value: (meal?.nutrition?.sugar ?? 'n/a').toString() + ' g',
                    disabled: true,
                },
                {
                    title: 'Fiber',
                    value: (meal?.nutrition?.fiber ?? 'n/a').toString() + ' g',
                    disabled: true,
                },
                {
                    title: 'Protein',
                    value:
                        (meal?.nutrition?.protein ?? 'n/a').toString() + ' g',
                    disabled: true,
                },
                {
                    title: 'Salt',
                    value: (meal?.nutrition?.salt ?? 'n/a').toString() + ' g',
                    disabled: true,
                },
            ],
        },
    ]

    const aboutSection: FormListSections[] = [
        {
            header: 'About',
            items: [
                {
                    title: 'Restaurant',
                    value: meal?.restaurant,
                    disabled: true,
                },
                {
                    title: 'Category',
                    value: meal?.category,
                    disabled: true,
                },
                {
                    title: 'Data Source',
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
            header: 'Variations',
            items:
                meal?.variations?.map((variant) => ({
                    title: variant.name.en,
                    value:
                        (variant.additional ? '+ ' : '') +
                        formatPrice(variant.prices[userKind]),
                    disabled: true,
                })) ?? [],
        },
    ]

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
                        {meal?.name.en}
                    </Text>
                </View>
                <View style={styles.formList}>
                    <FormList sections={sections} />
                </View>
                <View>
                    <Pressable
                        style={[
                            {
                                backgroundColor: colors.card,
                            },
                            styles.shareButton,
                        ]}
                        onPress={() => {
                            void Share.share({
                                message: `Checkout "${meal?.name
                                    .en}" (${formatPrice(
                                    meal?.prices[userKind]
                                )}) at ${meal?.restaurant}.\nhttps://neuland.app/food/`,
                            })
                        }}
                    >
                        <View style={styles.shareContent}>
                            <Ionicons
                                name="share-outline"
                                size={18}
                                color={colors.primary}
                            />

                            <Text
                                style={[
                                    { color: colors.primary },
                                    styles.shareText,
                                ]}
                            >
                                Share
                            </Text>
                        </View>
                    </Pressable>
                </View>
                <View style={styles.notesContainer}>
                    <Text
                        style={[styles.notesText, { color: colors.labelColor }]}
                    >
                        This meal has been automatically translated. We are not
                        responsible for the correctness of the data. Please
                        verify the correctness of the data with the respective
                        restaurant before consume anything.
                    </Text>
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    formList: {
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
        textAlign: 'justify',
        fontSize: 12,
    },
    shareButton: {
        alignSelf: 'center',
        paddingHorizontal: 35,
        paddingVertical: 9,
        borderRadius: 6,
        marginTop: 5,
    },
    shareContent: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    shareText: { fontSize: 16 },
})
