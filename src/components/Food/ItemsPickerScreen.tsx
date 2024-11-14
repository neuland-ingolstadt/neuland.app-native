import MultiSectionPicker from '@/components/Universal/MultiSectionPicker'
import { FoodFilterContext } from '@/components/contexts'
import allergenMap from '@/data/allergens.json'
import flapMap from '@/data/mensa-flags.json'
import { type LanguageKey } from '@/localization/i18n'
import { useNavigation } from 'expo-router'
import React, { useContext, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

/*
 * Screen for selecting allergens or preferences
 * @param type - type of the screen, either allergens or flags
 * @returns JSX.Element
 */
const ItemsPickerScreen = (params: {
    route: { params: { type: string } }
}): JSX.Element => {
    const type = params.route.params.type
    const data = type === 'allergens' ? allergenMap : flapMap
    const placeholderKey =
        type === 'allergens' ? 'allergensSearch' : 'flagsSearch'
    const isDark = UnistylesRuntime.themeName === 'dark'
    const { styles, theme } = useStyles(stylesheet)
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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: t(`navigation.${placeholderKey}`, {
                    ns: 'navigation',
                }),
                textColor: theme.colors.text,
                ...Platform.select({
                    android: {
                        headerIconColor: theme.colors.text,
                        hintTextColor: theme.colors.text,
                    },
                }),
                shouldShowHintSearchIcon: false,
                hideWhenScrolling: false,
                onChangeText: (event: { nativeEvent: { text: string } }) => {
                    setSearchQuery(event.nativeEvent.text)
                },
            },
        })
    }, [navigation, isDark])

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
            <View style={styles.container}>
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
                <Text style={styles.filteredText}>
                    {t(
                        // @ts-expect-error Translation key is dynamic
                        'empty.' + type
                    )}
                </Text>
            )}
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        width: '100%',
    },
    filteredText: {
        alignSelf: 'center',
        color: theme.colors.labelColor,
        marginTop: 20,
    },
}))

export default ItemsPickerScreen
