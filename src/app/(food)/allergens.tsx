import MultiSectionPicker from '@/components/Elements/Universal/MultiSectionPicker'
import allergenMap from '@/data/allergens.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext } from '@/stores/provider'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function Screen(): JSX.Element {
    const { t } = useTranslation('navigation')
    const Stack = createNativeStackNavigator()

    return (
        <>
            <Stack.Navigator>
                <Stack.Screen
                    name="Allergens"
                    options={{
                        title: t('navigation.allergens'),
                        headerShown: true,
                        headerLargeTitle: false,

                        ...Platform.select({
                            ios: {
                                headerTransparent: true,
                                headerBlurEffect: 'regular',
                            },
                        }),
                    }}
                    component={FoodAllergens}
                />
            </Stack.Navigator>
        </>
    )
}

function FoodAllergens(): JSX.Element {
    const { q } = useLocalSearchParams<{ q: string }>()
    const colors = useTheme().colors as Colors
    const { t, i18n } = useTranslation('food')

    let filteredAllergens = Object.entries(allergenMap)
        .filter(([key]) => key !== '_source')
        .map(([key, value]) => ({
            key,
            title: value[i18n.language as LanguageKey],
        }))

    if (q != null) {
        filteredAllergens = filteredAllergens.filter((item) =>
            item.title.toLowerCase().includes(q.toLowerCase())
        )
    }

    const { allergenSelection, toggleSelectedAllergens } =
        useContext(FoodFilterContext)
    filteredAllergens.sort((a, b) => a.title.localeCompare(b.title))

    const navigation = useNavigation()

    useEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: t('navigation.allergensSearch', {
                    ns: 'navigation',
                }),

                ...Platform.select({
                    android: {
                        headerIconColor: colors.text,
                        textColor: colors.text,
                        hintTextColor: colors.text,
                    },
                }),
                shouldShowHintSearchIcon: false,
                hideWhenScrolling: false,

                onChangeText: (event: { nativeEvent: { text: string } }) => {
                    router.setParams({
                        q: event.nativeEvent.text,
                    })
                },
            },
        })
    }, [navigation, colors.text])

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
            <StatusBar style={getStatusBarStyle()} />
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <MultiSectionPicker
                    elements={filteredAllergens}
                    selectedItems={allergenSelection}
                    action={toggleSelectedAllergens}
                />
            </View>
            {filteredAllergens.length === 0 && (
                <Text
                    style={[
                        {
                            color: colors.labelColor,
                        },
                        styles.filteredText,
                    ]}
                >
                    {t('empty.allergens')}
                </Text>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',

        width: '100%',
        justifyContent: 'center',
    },
    filteredText: {
        alignSelf: 'center',
        marginTop: 20,
    },
})
