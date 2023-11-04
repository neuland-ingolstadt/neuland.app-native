import FormList from '@/components/Elements/Universal/FormList'
import MultiSectionPicker from '@/components/Elements/Universal/MultiSectionPicker'
import SingleSectionPicker from '@/components/Elements/Universal/SingleSectionPicker'
import { type Colors } from '@/stores/colors'
import { FoodFilterContext } from '@/stores/provider'
import { type FormListSections } from '@customTypes/components'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

export default function FoodPreferences(): JSX.Element {
    const { t } = useTranslation('food')
    const locations = {
        mensa: t('cards.titles.mensa', { ns: 'navigation' }),
        reimanns: t('cards.titles.reimanns', { ns: 'navigation' }),
        canisius: t('cards.titles.canisius', { ns: 'navigation' }),
    }
    const elemtents = Object.entries(locations).map(([key, value]) => ({
        key,
        title: value,
    }))
    const colors = useTheme().colors as Colors
    const router = useRouter()

    const {
        selectedRestaurants,
        toggleSelectedRestaurant,
        showStatic,
        toggleShowStatic,
    } = useContext(FoodFilterContext)

    const sections: FormListSections[] = [
        {
            header: t('preferences.formlist.allergens'),
            items: [
                {
                    title: t('preferences.formlist.allergens'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(food)/allergens')
                    },
                },
            ],
        },
        {
            header: t('preferences.formlist.flags'),
            items: [
                {
                    title: t('preferences.formlist.flags'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(food)/flags')
                    },
                },
            ],
        },
    ]

    const SectionView = ({
        title,
        children,
    }: {
        title: string
        children: JSX.Element
    }): JSX.Element => {
        return (
            <View style={[styles.sectionContainer, { marginTop: 18 }]}>
                <Text
                    style={[
                        styles.labelText,
                        {
                            color: colors.labelSecondaryColor,
                        },
                    ]}
                >
                    {title}
                </Text>
                <View
                    style={[
                        styles.sectionBox,
                        {
                            backgroundColor: colors.card,
                        },
                    ]}
                >
                    {children}
                </View>
            </View>
        )
    }

    return (
        <>
            <View style={{ flex: 1 }}>
                <SectionView title={'Restaurants'}>
                    <MultiSectionPicker
                        elements={elemtents}
                        selectedItems={selectedRestaurants}
                        action={toggleSelectedRestaurant}
                    />
                </SectionView>
                <SectionView title={'Filter'}>
                    <SingleSectionPicker
                        title={'Show fixed meals'}
                        selectedItem={showStatic}
                        action={toggleShowStatic}
                    />
                </SectionView>
                <View style={styles.sectionContainer}>
                    <FormList sections={sections} />
                </View>
            </View>
            <View style={styles.notesBox}>
                <Text
                    style={[
                        styles.notesText,
                        {
                            color: colors.labelColor,
                        },
                    ]}
                >
                    {t('preferences.footer')}
                </Text>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    labelText: {
        fontSize: 12,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        marginTop: 2,
        justifyContent: 'center',
    },
    notesBox: {
        width: '92%',
        alignSelf: 'center',
        paddingBottom: 50,
    },
    notesText: {
        fontSize: 11,
        fontWeight: 'normal',
        paddingTop: 8,
        textAlign: 'justify',
    },
})
