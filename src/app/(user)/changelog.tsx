import FormList from '@/components/Elements/Universal/FormList'
import changelogData from '@/data/changelog.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@customTypes/components'
import { type Changelog } from '@customTypes/data'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function Theme(): JSX.Element {
    const colors = useTheme().colors as Colors
    const changelog: Changelog = changelogData
    const { t, i18n } = useTranslation(['settings'])
    const sorted = {
        version: Object.keys(changelog.version)
            .sort((a, b) => Number(b) - Number(a))
            .reduce(
                (
                    obj: Record<string, (typeof changelog.version)[string]>,
                    key
                ) => {
                    obj[key] = changelog.version[key]
                    return obj
                },
                {}
            ),
    }

    const sections: FormListSections[] = [
        ...Object.keys(sorted.version).map((key) => ({
            header: `Version ${key}`,
            items: sorted.version[key].map((item) => ({
                title: item.title[i18n.language as LanguageKey],
                disabled: true,
                icon: item.icon,
            })),
        })),
    ]
    return (
        <>
            <ScrollView>
                <View style={styles.wrapper}>
                    <FormList sections={sections} />
                </View>
                <View style={styles.notesContainer}>
                    <Text
                        style={[styles.notesText, { color: colors.labelColor }]}
                    >
                        {t('changelog.footer')}
                        <Text
                            style={{ color: colors.primary }}
                            onPress={() => {
                                void Linking.openURL(
                                    'https://github.com/neuland-ingolstadt/neuland.app-native/commits/'
                                )
                            }}
                        >
                            GitHub
                        </Text>
                        .
                    </Text>
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 16,
        alignSelf: 'center',
        width: '92%',
    },
    notesContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        width: '92%',
        marginBottom: 40,
    },
    notesText: {
        textAlign: 'left',
        fontSize: 13,
    },
})
