import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import changelogData from '@/data/changelog.json'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { Changelog } from '@/types/data'

export default function Theme(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const changelog = changelogData as Changelog
	const { t, i18n } = useTranslation(['settings'])
	const sorted: Changelog = {
		version: Object.keys(changelog.version)
			.sort((a, b) => {
				const [aParts, bParts] = [a, b].map((v) => v.split('.').map(Number))
				for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
					const [aPart, bPart] = [aParts[i] ?? 0, bParts[i] ?? 0]
					if (aPart !== bPart) return bPart - aPart
				}
				return 0
			})
			.reduce(
				// biome-ignore lint/performance/noAccumulatingSpread: TODO
				(obj, key) => ({ ...obj, [key]: changelog.version[key] }),
				{}
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
		<ScrollView contentContainerStyle={styles.scrollView}>
			<FormList sections={sections} />
			<View style={styles.notesContainer}>
				<Text style={styles.notesText}>
					{t('changelog.footer')}
					<Text
						style={styles.text}
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

const stylesheet = createStyleSheet((theme) => ({
	notesContainer: {
		flexDirection: 'row',
		marginTop: 8,
		marginBottom: 60
	},
	notesText: {
		color: theme.colors.labelColor,
		fontSize: 13,
		textAlign: 'left'
	},
	text: {
		color: theme.colors.primary
	},

	scrollView: {
		flex: 1,
		marginTop: 12,
		marginHorizontal: theme.margins.page
	}
}))
