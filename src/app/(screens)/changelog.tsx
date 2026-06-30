import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, View } from 'react-native'
import FormList from '@/components/Universal/form-list'
import changelogData from '@/data/changelog.json'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { Changelog } from '@/types/data'

export default function Theme(): React.JSX.Element {
	const changelog = changelogData as Changelog
	const { t, i18n } = useTranslation(['settings'])
	const sorted: Changelog = {
		version: Object.fromEntries(
			Object.keys(changelog.version)
				.sort((a, b) => {
					const [aParts, bParts] = [a, b].map((v) => v.split('.').map(Number))
					for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
						const [aPart, bPart] = [aParts[i] ?? 0, bParts[i] ?? 0]
						if (aPart !== bPart) return bPart - aPart
					}
					return 0
				})
				.map((key) => [key, changelog.version[key]])
		)
	}

	const sections: FormListSections[] = [
		...Object.keys(sorted.version).map((key) => ({
			header: `Version ${key}`,
			items: sorted.version[key].map((item) => ({
				title: item.title[i18n.language as LanguageKey],
				icon: item.icon
			}))
		}))
	]
	return (
		<ScrollView
			contentContainerClassName="flex-1 mt-3 mx-page"
			contentInsetAdjustmentBehavior="automatic"
		>
			<FormList sections={sections} />
			<View className="flex-row mt-2 mb-[60px]">
				<Text className="text-label text-[13px] text-left">
					{t('changelog.footer')}
					<Text
						className="text-primary"
						onPress={() => {
							void Linking.openURL(
								'https://github.com/neuland-ingolstadt/neuland.app-native/releases'
							)
						}}
					>
						{'GitHub'}
					</Text>
					.
				</Text>
			</View>
		</ScrollView>
	)
}
