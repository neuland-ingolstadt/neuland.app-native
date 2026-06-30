import { useNavigation, useRouter } from 'expo-router'
import React, { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import FormList from '@/components/Universal/form-list'
import licenses from '@/data/licenses'
import licensesStatic from '@/data/licenses-static.json'
import type { FormListSections } from '@/types/components'
import type { LicenseEntry } from '@/types/licenses'
import { toColor } from '@/utils/uniwind-utils'

export default function Licenses(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const textColor = toColor(useCSSVariable('--color-text'))
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
						headerIconColor: textColor,
						hintTextColor: textColor,
						textColor
					}
				}),

				onChangeText: (event: { nativeEvent: { text: string } }) => {
					const text = event.nativeEvent.text
					setLocalSearch(text)
				}
			}
		})
	}, [navigation, t, textColor])

	const licensesStaticFiltered = Object.fromEntries(
		Object.entries(licensesStatic).filter(
			([, license]) =>
				license.platform.includes(Platform.OS) ||
				license.platform.includes('all')
		)
	)

	const licensesCombined: Record<string, LicenseEntry> = {
		...licenses,
		...licensesStaticFiltered
	}

	const searchLower = localSearch.toLowerCase()
	const licensesList = Object.entries(licensesCombined)
		.sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
		.reduce<
			{
				title: string
				onPress: () => void
			}[]
		>((items, [key, value]: [string, LicenseEntry]) => {
			if (localSearch !== '' && !key.toLowerCase().includes(searchLower)) {
				return items
			}

			const version = numberRegex.exec(key)
			const nameWithoutVersion = key
				.replace(atRegex, '')
				.replace(version != null ? version[0] : '', '')

			items.push({
				title: nameWithoutVersion,
				onPress: () => {
					router.navigate({
						pathname: '/license',

						params: {
							license: value.licenses,
							version: version != null ? version[0] : '',
							licenseUrl: value.licenseUrl ?? '',
							repository: value.repository,
							name: nameWithoutVersion
						}
					})
				}
			})

			return items
		}, [])

	const sections: FormListSections[] = [
		{
			header: t('navigation.licenses.title', { ns: 'navigation' }),
			items: [...licensesList]
		}
	]
	return (
		<ScrollView
			contentContainerClassName="pb-modal-bottom"
			contentInsetAdjustmentBehavior="automatic"
		>
			<View className="self-center mb-6 mt-2.5 px-page w-full">
				<FormList sections={sections} />
				<View className="self-center mb-10 mt-3.5 w-full">
					<Text className="text-label text-xs text-left">
						{t('licenses.footer')}
					</Text>
				</View>
			</View>
		</ScrollView>
	)
}
