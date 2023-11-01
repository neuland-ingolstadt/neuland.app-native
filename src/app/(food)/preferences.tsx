import FormList from '@/components/Elements/Universal/FormList'
import { SectionPicker } from '@/components/Elements/Universal/SectionPicker'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext } from '@/stores/provider'
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
        <>
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        marginTop: 18,
                        paddingHorizontal: 16,
                        width: '100%',
                        alignSelf: 'center',
                    }}
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

                    <FormList sections={sections} />
                </View>
            </View>
            <View
                style={{
                    width: '92%',
                    alignSelf: 'center',
                    paddingBottom: 50,
                }}
            >
                <Text
                    style={{
                        fontSize: 11,
                        fontWeight: 'normal',
                        color: colors.labelColor,
                        paddingTop: 8,
                        textAlign: 'justify',
                    }}
                >
                    We are not responsible for the correctness of the data.
                    Please verify the data with the respective restaurant before
                    consume anything. You can also check the data source of each
                    meal in the details view.
                </Text>
            </View>
        </>
    )
}
