import MultiSectionPicker from '@/components/Elements/Universal/MultiSectionPicker'
import allergenMap from '@/data/allergens.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext } from '@/stores/provider'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useGlobalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

export default function FoodPreferences(): JSX.Element {
    const { q } = useGlobalSearchParams<{ q: string }>()
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

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
            <StatusBar style={getStatusBarStyle()} />
            <View style={[styles.container, { backgroundColor: colors.card }]}>
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
