import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import changelogData from '@/stores/data/changelog.json'
import { type FormListSections } from '@customTypes/components'
import { type Changelog } from '@customTypes/data'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function Theme(): JSX.Element {
    const colors = useTheme().colors as Colors
    const changelog: Changelog = changelogData

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
                title: item.title.en,
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
                        To see the full changelog, check out the commits on{' '}
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
        textAlign: 'justify',
        fontSize: 13,
    },
})
