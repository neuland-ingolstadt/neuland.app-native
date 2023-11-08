import MultiSectionPicker from '@/components/Elements/Universal/MultiSectionPicker'
import flapMap from '@/data/mensa-flags.json'
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
    const Stack = createNativeStackNavigator()
    const { t } = useTranslation('navigation')

    return (
        <>
            <Stack.Navigator>
                <Stack.Screen
                    name={'Flags'}
                    options={{
                        title: t('navigation.flags'),
                        headerShown: true,
                        headerLargeTitle: false,
                        ...Platform.select({
                            ios: {
                                headerTransparent: true,
                                headerBlurEffect: 'regular',
                            },
                        }),
                    }}
                    component={FoodPreferences}
                />
            </Stack.Navigator>
        </>
    )
}

function FoodPreferences(): JSX.Element {
    const { q } = useLocalSearchParams<{ q: string }>()
    const colors = useTheme().colors as Colors
    const { t, i18n } = useTranslation('food')

    let filteredFlags = Object.entries(flapMap)
        .filter(([key]) => key !== '_source')
        .map(([key, value]) => ({
            key,
            title: value[i18n.language as LanguageKey],
        }))

    if (q != null) {
        filteredFlags = filteredFlags.filter((item) =>
            item.title.toLowerCase().includes(q.toLowerCase())
        )
    }

    const { preferencesSelection, toggleSelectedPreferences } =
        useContext(FoodFilterContext)
    filteredFlags.sort((a, b) => a.title.localeCompare(b.title))

    const navigation = useNavigation()

    useEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: t('navigation.flagsSearch', { ns: 'navigation' }),

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
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <MultiSectionPicker
                    elements={filteredFlags}
                    selectedItems={preferencesSelection}
                    action={toggleSelectedPreferences}
                />
            </View>
            {filteredFlags.length === 0 && (
                <Text
                    style={[
                        {
                            color: colors.labelColor,
                        },
                        styles.filteredText,
                    ]}
                >
                    {t('empty.preferences')}
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
