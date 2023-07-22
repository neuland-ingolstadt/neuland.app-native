import { SectionPicker } from '@/components/SectionPicker'
import flapMap from '@/stores/data/mensa-flags.json'
import { type Colors, FoodFilterContext } from '@/stores/provider'
import { useTheme } from '@react-navigation/native'
import { useGlobalSearchParams } from 'expo-router'
import React, { useContext } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

export default function FoodPreferences(): JSX.Element {
    const { q } = useGlobalSearchParams<{ q: string }>()
    const colors = useTheme().colors as Colors
    let filteredFlags = Object.entries(flapMap)
        .filter(([key]) => key !== '_source')
        .map(([key, value]) => ({
            key,
            title: value.en,
        }))

    if (q != null) {
        filteredFlags = filteredFlags.filter((item) =>
            item.title.toLowerCase().includes(q.toLowerCase())
        )
    }

    const { preferencesSelection, toggleSelectedPreferences } =
        useContext(FoodFilterContext)
    filteredFlags.sort((a, b) => a.title.localeCompare(b.title))

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <SectionPicker
                    elements={filteredFlags}
                    selectedItems={preferencesSelection}
                    action={toggleSelectedPreferences}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',

        width: '100%',
        justifyContent: 'center',
    },
})
