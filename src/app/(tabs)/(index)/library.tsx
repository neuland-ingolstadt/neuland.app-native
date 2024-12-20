/* eslint-disable react-native/no-inline-styles */
import LibraryCard from '@/components/Library/LibraryCard'
import { libraryLink, vscoutLink } from '@/data/constants'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function LibraryScreen(): React.JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    {t('navigation.library', {
                        ns: 'navigation',
                    })}
                </Text>
            </View>
            <View style={styles.cards}>
                <LibraryCard
                    onPress={() => {
                        Linking.openURL(vscoutLink).catch((err) => {
                            console.error(err)
                        })
                    }}
                    iconProps={{
                        ios: { name: 'chair', size: 18 },
                        android: {
                            name: 'chair',
                            size: 22,
                            variant: 'outlined',
                        },
                        web: { name: 'Armchair', size: 20 },
                    }}
                    title={t('pages.library.seatReservation.title')}
                    description={t('pages.library.seatReservation.description')}
                />
                <LibraryCard
                    onPress={() => {
                        Linking.openURL(libraryLink).catch((err) => {
                            console.error(err)
                        })
                    }}
                    iconProps={{
                        ios: { name: 'text.magnifyingglass', size: 18 },
                        android: {
                            name: 'library_books',
                            size: 22,
                            variant: 'outlined',
                        },
                        web: { name: 'Search', size: 20 },
                    }}
                    title={t('pages.library.catalog.title')}
                    description={t('pages.library.catalog.description')}
                />
                <LibraryCard
                    onPress={() => {
                        router.dismiss()
                        router.navigate('/libraryCode')
                    }}
                    iconProps={{
                        ios: { name: 'barcode.viewfinder', size: 18 },
                        android: { name: 'barcode_scanner', size: 22 },
                        web: { name: 'ScanBarcode', size: 20 },
                    }}
                    title={t('pages.library.virtualCard.title')}
                    description={t('pages.library.virtualCard.description')}
                />
            </View>
            <Text style={styles.notesText}>{t('pages.library.note')}</Text>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    cards: {
        gap: theme.margins.page,
        paddingTop: 2,
    },
    container: {
        paddingHorizontal: theme.margins.page,
    },
    headerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerText: {
        color: theme.colors.text,
        fontSize: 23,
        fontWeight: '600',
        paddingBottom: 10,
        paddingTop: 5,
    },
    notesText: {
        color: theme.colors.labelColor,
        fontSize: 12,
        marginTop: 8,
    },
}))
