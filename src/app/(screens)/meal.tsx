import ErrorView from '@/components/Error/ErrorView'
import FormList from '@/components/Universal/FormList'
import PlatformIcon, { linkIcon } from '@/components/Universal/Icon'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import { UserKindContext } from '@/components/contexts'
import allergenMap from '@/data/allergens.json'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import flagMap from '@/data/mensa-flags.json'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import {
    formatPrice,
    humanLocations,
    mealName,
    shareMeal,
} from '@/utils/food-utils'
import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { Stack, router, useFocusEffect, useNavigation } from 'expo-router'
import type React from 'react'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, Share, Text, View } from 'react-native'
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function FoodDetail(): React.JSX.Element {
    const meal = useRouteParamsStore((state) => state.selectedMeal)
    const { styles, theme } = useStyles(stylesheet)

    const preferencesSelection = useFoodFilterStore(
        (state) => state.preferencesSelection
    )
    const allergenSelection = useFoodFilterStore(
        (state) => state.allergenSelection
    )
    const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
    const toggleSelectedPreferences = useFoodFilterStore(
        (state) => state.toggleSelectedPreferences
    )
    const toggleSelectedAllergens = useFoodFilterStore(
        (state) => state.toggleSelectedAllergens
    )
    const { t, i18n } = useTranslation('food')
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const dataSources = {
        IngolstadtMensa: 'https://www.werkswelt.de/?id=ingo',
        NeuburgMensa: 'https://www.werkswelt.de/?id=mtneuburg',
        Reimanns: 'http://reimanns.in/mittagsgerichte-wochenkarte/',
        Canisius: 'http://www.canisiusstiftung.de/upload/speiseplan.pdf',
    }

    const ref = useAnimatedRef<Animated.ScrollView>()
    const scroll = useScrollViewOffset(ref)
    const headerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scroll.value,
                        [0, 100],
                        [30, 0],
                        'clamp'
                    ),
                },
            ],
        }
    })

    const navigation = useNavigation()

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

        if (Platform.OS === 'web') {
            if (
                !window.confirm(
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
                          )
                )
            ) {
                /* empty */
            } else {
                if (itemType === 'allergen') {
                    toggleSelectedAllergens(item)
                } else if (itemType === 'flag') {
                    toggleSelectedPreferences(item)
                }
            }
        } else {
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
                        onPress: () => {
                            /* empty */
                        },
                        style: 'cancel',
                    },
                ]
            )
        }
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
                    value: `${(meal?.nutrition?.kj ?? 'n/a').toString()} kJ / ${(meal?.nutrition?.kcal ?? 'n/a').toString()} kcal`,
                },

                {
                    title: t('details.formlist.nutrition.fat'),
                    value: `${(meal?.nutrition?.fat ?? 'n/a').toString()} g`,
                },
                {
                    title: t('details.formlist.nutrition.saturated'),
                    value: `${(meal?.nutrition?.fatSaturated ?? 'n/a').toString()} g`,
                },
                {
                    title: t('details.formlist.nutrition.carbs'),
                    value: `${(meal?.nutrition?.carbs ?? 'n/a').toString()} g`,
                },
                {
                    title: t('details.formlist.nutrition.sugar'),
                    value: `${(meal?.nutrition?.sugar ?? 'n/a').toString()} g`,
                },
                {
                    title: t('details.formlist.nutrition.fiber'),
                    value: `${(meal?.nutrition?.fiber ?? 'n/a').toString()} g`,
                },
                {
                    title: t('details.formlist.nutrition.protein'),
                    value: `${(meal?.nutrition?.protein ?? 'n/a').toString()} g`,
                },
                {
                    title: t('details.formlist.nutrition.salt'),
                    value: `${(meal?.nutrition?.salt ?? 'n/a').toString()} g`,
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
                              web: 'BadgeCheck',
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
                                  web: 'TriangleAlert',
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
    const humanLocation =
        humanLocations[restaurant as keyof typeof humanLocations]
    const humanCategory = t(
        // @ts-expect-error cannot verify the TFunction type
        `categories.${meal?.category}`
    ) as string

    const aboutSection: FormListSections[] = [
        {
            header: t('details.formlist.about.title'),
            items: [
                {
                    title: 'Restaurant',
                    value: humanLocation,
                    onPress: handlePress,
                    textColor: locationExists
                        ? theme.colors.primary
                        : undefined,
                    disabled: !locationExists,
                },
                {
                    title: t('details.formlist.about.category'),
                    value: humanCategory,
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
        }
        return i18n.language === 'de'
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

    const title = meal
        ? mealName(meal.name, foodLanguage, i18n.language as LanguageKey)
        : ''

    return (
        <Animated.ScrollView contentContainerStyle={styles.page} ref={ref}>
            <Stack.Screen
                options={{
                    headerTitle: (props) => (
                        <View style={styles.headerTitle}>
                            <Animated.View style={headerStyle}>
                                <HeaderTitle
                                    {...props}
                                    tintColor={theme.colors.text}
                                >
                                    {title}
                                </HeaderTitle>
                            </Animated.View>
                        </View>
                    ),
                }}
            />
            <View style={styles.titleContainer}>
                <Text
                    style={styles.titleText}
                    adjustsFontSizeToFit={true}
                    numberOfLines={3}
                    minimumFontScale={0.8}
                    selectable={true}
                >
                    {title}
                </Text>
            </View>

            <Text style={styles.subtitleText}>
                {humanLocation} - {humanCategory}
            </Text>
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
                        web={{
                            name: 'TriangleAlert',
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
        </Animated.ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    formList: {
        alignSelf: 'center',
        marginVertical: 16,
        width: '100%',
    },
    headerTitle: {
        marginBottom: Platform.OS === 'ios' ? -10 : 0,
        overflow: 'hidden',
        paddingRight: Platform.OS === 'ios' ? 0 : 50,
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
    },
    notesText: {
        color: theme.colors.labelColor,
        flex: 1,
        flexShrink: 1,
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
    },
    page: {
        marginHorizontal: theme.margins.page,
    },
    subtitleText: {
        color: theme.colors.labelColor,
        fontSize: 16,
        fontWeight: '600',
    },
    titleContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 6,
    },
    titleText: {
        color: theme.colors.text,
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        paddingTop: 16,
        textAlign: 'left',
    },
}))
