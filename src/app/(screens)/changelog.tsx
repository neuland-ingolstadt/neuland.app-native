import FormList from '@/components/Universal/FormList'
import changelogData from '@/data/changelog.json'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { Changelog } from '@/types/data'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Theme(): React.JSX.Element {
    const { styles } = useStyles(stylesheet)
    const changelog = changelogData as Changelog
    const { t, i18n } = useTranslation(['settings'])
    const sorted: Changelog = {
        version: Object.keys(changelog.version)
            .sort((a, b) => {
                const [aParts, bParts] = [a, b].map((v) =>
                    v.split('.').map(Number)
                )
                for (
                    let i = 0;
                    i < Math.max(aParts.length, bParts.length);
                    i++
                ) {
                    const [aPart, bPart] = [aParts[i] ?? 0, bParts[i] ?? 0]
                    if (aPart !== bPart) return bPart - aPart
                }
                return 0
            })
            // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
            .reduce(
                (obj, key) => ({ ...obj, [key]: changelog.version[key] }),
                {}
            ),
    }

    const sections: FormListSections[] = [
        ...Object.keys(sorted.version).map((key) => ({
            header: `Version ${key}`,
            items: sorted.version[key].map((item) => ({
                title: item.title[i18n.language as LanguageKey],
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
                    <Text style={styles.notesText}>
                        {t('changelog.footer')}
                        <Text
                            style={styles.text}
                            onPress={() => {
                                void Linking.openURL(
                                    'https://github.com/neuland-ingolstadt/neuland.app-native/blob/main/CHANGELOG.md'
                                )
                            }}
                        >
                            {'GitHub'}
                        </Text>
                        .
                    </Text>
                </View>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    notesContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: 40,
        width: '92%',
    },
    notesText: {
        color: theme.colors.labelColor,
        fontSize: 13,
        textAlign: 'left',
    },
    text: {
        color: theme.colors.primary,
    },
    wrapper: {
        alignSelf: 'center',
        marginVertical: 16,
        width: '92%',
    },
}))
