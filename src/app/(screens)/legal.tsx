import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import { IMPRINT_URL, PRIVACY_URL } from '@/data/constants'
import type { FormListSections } from '@/types/components'

export default function About(): React.JSX.Element {
	const router = useRouter()
	const { styles } = useStyles(stylesheet)
	const { t, i18n } = useTranslation(['settings'])

	const sections: FormListSections[] = [
		{
			header: t('about.formlist.legal.title'),
			items: [
				{
					title: t('legal.formlist.legal.privacy'),
					icon: {
						ios: 'lock.shield',
						android: 'shield_lock',
						web: 'ShieldCheck'
					},
					onPress: async () =>
						(await Linking.openURL(PRIVACY_URL)) as Promise<void>
				},
				{
					title: t('legal.formlist.legal.imprint'),
					icon: {
						ios: 'doc.text',
						android: 'description',
						web: 'FileText'
					},
					onPress: async () =>
						(await Linking.openURL(IMPRINT_URL)) as Promise<void>
				},
				{
					title: t('navigation.licenses.title', { ns: 'navigation' }),
					icon: {
						ios: 'shield',
						android: 'shield',
						web: 'Shield'
					},
					onPress: () => {
						router.navigate('/licenses')
					}
				}
			]
		},
		{
			header: t('legal.formlist.us.title'),
			items: [
				{
					title: 'Neuland Ingolstadt e.V.',
					icon: {
						ios: 'building.2',
						android: 'apartment',
						web: 'Building2'
					},
					onPress: async () =>
						(await Linking.openURL(
							'https://neuland-ingolstadt.de/'
						)) as Promise<void>
				},
				{
					title: t('legal.formlist.us.source'),
					icon: {
						ios: 'chevron.left.slash.chevron.right',
						android: 'code',
						web: 'Code'
					},
					onPress: async () =>
						(await Linking.openURL(
							'https://github.com/neuland-ingolstadt/neuland.app-native'
						)) as Promise<void>
				},
				{
					title: t('legal.formlist.us.faq'),
					icon: {
						ios: 'questionmark.circle',
						android: 'help',
						web: 'CircleHelp'
					},
					onPress: async () =>
						(await Linking.openURL(
							`https://next.neuland.app/${i18n.language === 'en' ? 'en/' : ''}app/faq`
						)) as Promise<void>
				}
			]
		}
	]

	return (
		<>
			<ScrollView contentContainerStyle={styles.contentContainer}>
				<View style={styles.formlistContainer}>
					<FormList sections={sections} />
				</View>
			</ScrollView>
		</>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	contentContainer: {
		paddingBottom: theme.margins.bottomSafeArea
	},
	formlistContainer: {
		alignSelf: 'center',
		marginTop: 10,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	}
}))
