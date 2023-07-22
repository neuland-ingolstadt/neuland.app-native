import FormList from '@/components/FormList'
import { SectionPicker } from '@/components/SectionPicker'
import { type Colors, FoodFilterContext } from '@/stores/provider'
import { type FormListSections } from '@customTypes/components'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { Text, View } from 'react-native'

export default function FoodPreferences(): JSX.Element {
    const locations = {
        mensa: { de: 'Mensa', en: 'Mensa' },
        reimanns: { de: 'Reimanns', en: 'Reimanns' },
        canisius: { de: 'Canisius Konvikt', en: 'Canisius Konvikt' },
    }
    const elemtents = Object.entries(locations).map(([key, value]) => ({
        key,
        title: value.en,
    }))

    const colors = useTheme().colors as Colors
    const router = useRouter()

    const { selectedRestaurants, toggleSelectedRestaurant } =
        useContext(FoodFilterContext)

    const sections: FormListSections[] = [
        {
            header: 'Allergens',
            items: [
                {
                    title: 'Allergens',
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(food)/allergens')
                    },
                },
            ],
        },
        {
            header: 'Flags',
            items: [
                {
                    title: 'Flags',
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(food)/flags')
                    },
                },
            ],
        },
    ]

    return (
        <View>
            <>
                <View
                    style={{ marginTop: 18, width: '92%', alignSelf: 'center' }}
                >
                    <Text
                        style={{
                            fontSize: 12,
                            color: colors.labelSecondaryColor,
                            fontWeight: 'normal',
                            textTransform: 'uppercase',
                            marginBottom: 4,
                        }}
                    >
                        {'Restaurants'}
                    </Text>

                    <View
                        style={{
                            alignSelf: 'center',
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            width: '100%',
                            marginTop: 2,
                            justifyContent: 'center',
                        }}
                    >
                        <SectionPicker
                            elements={elemtents}
                            selectedItems={selectedRestaurants}
                            action={toggleSelectedRestaurant}
                        />
                    </View>
                </View>
            </>

            <FormList sections={sections} />
            <Text
                style={{
                    fontSize: 11,
                    margin: 17,
                    fontWeight: 'normal',
                    color: colors.labelColor,
                    textAlign: 'justify',
                }}
            >
                We do not store any of your data on our servers. All data is
                only stored locally on your device.
            </Text>
        </View>
    )
}
