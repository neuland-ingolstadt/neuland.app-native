import MultiSectionPicker from '@/components/Elements/Universal/MultiSectionPicker'
import allergenMap from '@/data/allergens.json'
import flapMap from '@/data/mensa-flags.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext } from '@/stores/provider'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

/*
 * Screen for selecting allergens or preferences
 * @param type - type of the screen, either allergens or flags
 */
const ItemsPickerScreen = (params: {
    route: { params: { type: string } }
}): JSX.Element => {
    const type = params.route.params.type
    const data = type === 'allergens' ? allergenMap : flapMap
    const placeholderKey =
        type === 'allergens' ? 'allergensSearch' : 'flagsSearch'
    const colors = useTheme().colors as Colors
    const { t, i18n } = useTranslation('food')
    const [searchQuery, setSearchQuery] = useState<string>('')

    let filteredEntries = Object.entries(data)
        .filter(([key]) => key !== '_source')
        .map(([key, value]) => ({
            key,
            title: value[i18n.language as LanguageKey],
        }))

    if (searchQuery != null) {
        filteredEntries = filteredEntries.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    const { preferencesSelection, toggleSelectedPreferences } =
        useContext(FoodFilterContext)
    const { allergenSelection, toggleSelectedAllergens } =
        useContext(FoodFilterContext)

    filteredEntries.sort((a, b) => a.title.localeCompare(b.title))

    const navigation = useNavigation()

    useEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: t(`navigation.${placeholderKey}`, {
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
                    setSearchQuery(event.nativeEvent.text)
                },
            },
        })
    }, [navigation, colors.text])

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
            <StatusBar style={getStatusBarStyle()} />
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <MultiSectionPicker
                    elements={filteredEntries}
                    selectedItems={
                        type === 'allergens'
                            ? allergenSelection
                            : preferencesSelection
                    }
                    action={
                        type === 'allergens'
                            ? toggleSelectedAllergens
                            : toggleSelectedPreferences
                    }
                />
            </View>
            {filteredEntries.length === 0 && (
                <Text
                    style={[
                        {
                            color: colors.labelColor,
                        },
                        styles.filteredText,
                    ]}
                >
                    {t('empty.' + type)}
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

export default ItemsPickerScreen
