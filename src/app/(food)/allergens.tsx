import { SectionPicker } from '@/components/SectionPicker'
import { type Colors } from '@/stores/colors'
import allergenMap from '@/stores/data/allergens.json'
import { FoodFilterContext } from '@/stores/provider'
import { useTheme } from '@react-navigation/native'
import { useGlobalSearchParams } from 'expo-router'
import React, { useContext } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

export default function FoodPreferences(): JSX.Element {
    const { q } = useGlobalSearchParams<{ q: string }>()
    const colors = useTheme().colors as Colors
    let filteredAllergens = Object.entries(allergenMap)
        .filter(([key]) => key !== '_source')
        .map(([key, value]) => ({
            key,
            title: value.en,
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
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <SectionPicker
                    elements={filteredAllergens}
                    selectedItems={allergenSelection}
                    action={toggleSelectedAllergens}
                />
            </View>
            {filteredAllergens.length === 0 && (
                <Text
                    style={{
                        alignSelf: 'center',
                        marginTop: 20,
                        color: colors.labelColor,
                    }}
                >
                    No matching allergens found.
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
})
