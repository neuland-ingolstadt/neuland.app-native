import FormList from '@/components/Universal/FormList'
import licensesStatic from '@/data/licenses-static.json'
import licenses from '@/data/licenses.json'
import type { FormListSections } from '@/types/components'
import { useNavigation, useRouter } from 'expo-router'
import React, { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export interface LicenseEntry {
	licenses: string
	repository?: string // Make repository optional
	licenseUrl: string
	parents: string
}

export default function Licenses(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const { styles, theme } = useStyles(stylesheet)
	const numberRegex = /\d+(\.\d+)*/
	const atRegex = /(?:@)/gi
	const navigation = useNavigation()
	const [localSearch, setLocalSearch] = React.useState('')

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				placeholder: t('navigation.licenses.search', {
					ns: 'navigation'
				}),

				...Platform.select({
					android: {
						headerIconColor: theme.colors.text,
						hintTextColor: theme.colors.text,
						textColor: theme.colors.text
					}
				}),

				onChangeText: (event: { nativeEvent: { text: string } }) => {
					const text = event.nativeEvent.text
					setLocalSearch(text)
				}
			}
		})
	}, [navigation])

	const licensesStaticFiltered = Object.entries(licensesStatic)
		.filter(
			([, license]) =>
				license.platform.includes(Platform.OS) ||
				license.platform.includes('all')
		)
		// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
		.reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

	const licensesCombined = { ...licenses, ...licensesStaticFiltered }

	const licensesList = Object.entries(licensesCombined)
		.sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
		// also sort by search
		.filter(([key]) => {
			if (localSearch === '') {
				return true
			}
			return key.toLowerCase().includes(localSearch.toLowerCase())
		})
		.map(([key, value]: [string, LicenseEntry]) => {
			const version = numberRegex.exec(key)
			const nameWithoutVersion = key
				.replace(atRegex, '')
				.replace(version != null ? version[0] : '', '')

			return {
				title: nameWithoutVersion,
				onPress: () => {
					router.navigate({
						pathname: '/license',

						params: {
							license: value.licenses,
							version: version != null ? version[0] : '',
							licenseUrl: value.licenseUrl,
							repository: value.repository,
							name: nameWithoutVersion
						}
					})
				}
			}
		})

	const sections: FormListSections[] = [
		{
			header: t('navigation.licenses.title', { ns: 'navigation' }),
			items: [...licensesList]
		}
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
						<Text style={styles.notesText}>{t('licenses.footer')}</Text>
					</View>
				</View>
			</ScrollView>
		</>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		paddingBottom: theme.margins.modalBottomMargin
	},
	formlistContainer: {
		alignSelf: 'center',
		marginBottom: 24,
		marginTop: 10,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	},
	notesContainer: {
		alignSelf: 'center',
		marginBottom: 40,
		marginTop: 14,
		width: '100%'
	},
	notesText: {
		color: theme.colors.labelColor,
		fontSize: 12,
		textAlign: 'left'
	}
}))
