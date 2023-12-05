import FormList from '@/components/Elements/Universal/FormList'
import { chevronIcon } from '@/components/Elements/Universal/Icon'
import licensesStatic from '@/data/licenses-static.json'
import licenses from '@/data/licenses.json'
import { type FormListSections } from '@/types/components'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'

export default function Licenses(): JSX.Element {
    const router = useRouter()
    const { t } = useTranslation(['settings'])

    const numberRegex = /\d+(\.\d+)*/
    const atRegex = /(?:@)/gi

    const licensesStaticFiltered = Object.entries(licensesStatic)
        .filter(([key, license]) => license.platform.includes(Platform.OS))
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

    const licensesCombined = { ...licenses, ...licensesStaticFiltered }

    const licensesList = Object.entries(licensesCombined).map(
        ([key, value]) => {
            const version = key.match(numberRegex)
            const nameWithoutVersion = key
                .replace(atRegex, '')
                .replace(version != null ? version[0] : '', '')

            return {
                title: nameWithoutVersion,
                icon: chevronIcon,
                onPress: async () => {
                    router.push('(user)/license')
                    router.setParams({
                        license: value.licenses,
                        version: version != null ? version[0] : '',
                        licenseUrl: value.licenseUrl,
                        repository: value.repository,
                        name: nameWithoutVersion,
                    })
                },
            }
        }
    )

    const sections: FormListSections[] = [
        {
            header: t('navigation.licenses', { ns: 'navigation' }),
            items: [...licensesList],
        },
    ]
    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    formlistContainer: {
        marginTop: 10,
        maringBottom: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    container: {
        paddingBottom: MODAL_BOTTOM_MARGIN,
    },
})
