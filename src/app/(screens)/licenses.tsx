import FormList from '@/components/Elements/Universal/FormList'
import { chevronIcon } from '@/components/Elements/Universal/Icon'
import licensesStatic from '@/data/licenses-static.json'
import licenses from '@/data/licenses.json'
import { type FormListSections } from '@/types/components'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { useNavigation, useRouter } from 'expo-router'
import React, { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Licenses(): JSX.Element {
    const router = useRouter()
    const { t } = useTranslation(['settings'])
    const { styles } = useStyles(stylesheet)
    const numberRegex = /\d+(\.\d+)*/
    const atRegex = /(?:@)/gi
    const navigation = useNavigation()
    const [localSearch, setLocalSearch] = React.useState('')

    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: t('navigation.licenses.search', {
                    ns: 'navigation',
                }),

                ...Platform.select({
                    android: {
                        headerIconColor: styles.searchTextInput.color,
                        hintTextColor: styles.searchTextInput.color,
                        textColor: styles.searchTextInput.color,
                    },
                }),

                onChangeText: (event: { nativeEvent: { text: string } }) => {
                    const text = event.nativeEvent.text
                    setLocalSearch(text)
                },
            },
        })
    }, [navigation])

    const licensesStaticFiltered = Object.entries(licensesStatic)
        .filter(
            ([_, license]) =>
                license.platform.includes(Platform.OS) ||
                license.platform.includes('all')
        )
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

    const licensesCombined = { ...licenses, ...licensesStaticFiltered }

    const licensesList = Object.entries(licensesCombined)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        // also sort by search
        .filter(([key, value]) => {
            if (localSearch === '') {
                return true
            }
            return key.toLowerCase().includes(localSearch.toLowerCase())
        })
        .map(([key, value]) => {
            const version = key.match(numberRegex)
            const nameWithoutVersion = key
                .replace(atRegex, '')
                .replace(version != null ? version[0] : '', '')

            return {
                title: nameWithoutVersion,
                icon: chevronIcon,
                onPress: async () => {
                    router.navigate('license')
                    router.setParams({
                        license: value.licenses,
                        version: version != null ? version[0] : '',
                        licenseUrl: value.licenseUrl,
                        repository: value.repository,
                        name: nameWithoutVersion,
                    })
                },
            }
        })

    const sections: FormListSections[] = [
        {
            header: t('navigation.licenses.title', { ns: 'navigation' }),
            items: [...licensesList],
        },
    ]
    return (
        <>
            <ScrollView
                contentContainerStyle={styles.container}
                contentInsetAdjustmentBehavior="automatic"
            >
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>
                            {t('licenses.footer')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    formlistContainer: {
        marginTop: 10,
        marginBottom: 24,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    container: {
        paddingBottom: MODAL_BOTTOM_MARGIN,
    },
    notesContainer: {
        alignSelf: 'center',
        width: '100%',
        marginTop: 14,
        marginBottom: 40,
    },
    notesText: {
        textAlign: 'left',
        fontSize: 12,
        color: theme.colors.labelColor,
    },
    searchTextInput: {
        color: theme.colors.text,
    },
}))
