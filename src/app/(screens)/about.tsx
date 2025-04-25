import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import SingleSectionPicker from '@/components/Universal/SingleSectionPicker'
import { PRIVACY_URL, STATUS_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import i18n from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import { trackEvent } from '@aptabase/react-native'
import { alert } from 'burnt'
import * as Application from 'expo-application'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Image,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function About(): React.JSX.Element {
	const router = useRouter()
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])

	const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)

	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const addUnlockedAppIcon = usePreferencesStore(
		(state) => state.addUnlockedAppIcon
	)
	const version =
		Application.nativeApplicationVersion ??
		Constants.expoConfig?.version ??
		'unknown'
	const commitHash =
		process.env.EXPO_PUBLIC_GIT_COMMIT_HASH ?? process.env.GIT_COMMIT_HASH
	const commitUrl = `https://github.com/neuland-ingolstadt/neuland.app-native/commit/${commitHash}`
	const commitHashShort = commitHash?.substring(0, 7)

	const toggleVersion = (): void => {
		let message = `Version: ${version}`
		if (Platform.OS !== 'web') {
			message += `\nBuild: ${Application.nativeBuildVersion ?? '0'}`
			if (commitHash) {
				message += `\nCommit: ${commitHashShort}`
			}
		} else {
			if (commitHash) {
				message += `\nCommit: ${commitHashShort}`
				message += '\nPress OK to open the commit link.'
			}
		}
		if (Platform.OS === 'web') {
			if (window.confirm(message)) {
				if (commitHash) void Linking.openURL(commitUrl)
			}
			return
		}
		const buttons = commitHash
			? [
					{ text: 'Cancel', style: 'cancel' as const },
					{
						text: 'Open Commit',
						onPress: () => void Linking.openURL(commitUrl)
					}
				]
			: [{ text: 'Cancel', style: 'cancel' as const }]
		Alert.alert('Version Info', message, buttons)
	}

	const sections: FormListSections[] = [
		{
			header: 'App',
			items: [
				{
					title: 'Version',
					icon: {
						ios: 'info.circle',
						android: 'info',
						web: 'Info'
					},
					layout: 'row',
					value: version,
					onPress: toggleVersion
				},
				{
					title: 'Changelog',
					icon: {
						ios: 'list.bullet.rectangle',
						android: 'article',
						web: 'FileText'
					},
					onPress: () => {
						router.navigate('/changelog')
					}
				},
				{
					title: 'System Status',
					icon: {
						ios: 'bubble.left.and.exclamationmark.bubble.right',
						android: 'troubleshoot',
						web: 'HeartPulse'
					},
					onPress: () => {
						void Linking.openURL(STATUS_URL)
					}
				}
			]
		},
		{
			header: t('about.formlist.contact.title'),
			items: [
				{
					title: t('about.formlist.contact.feedback'),
					icon: {
						ios: 'envelope',
						android: 'mail',
						web: 'Mail'
					},
					onPress: async () =>
						(await Linking.openURL(
							'mailto:app-feedback@informatik.sexy?subject=Feedback%20Neuland-Next'
						)) as Promise<void>
				},
				{
					title: 'App Website',
					icon: linkIcon,
					onPress: async () =>
						(await Linking.openURL(
							`https://next.neuland.app/${i18n.language === 'en' ? 'en/' : ''}`
						)) as Promise<void>
				},
				{
					title:
						Platform.OS === 'ios'
							? t('about.formlist.contact.rateiOS')
							: t('about.formlist.contact.rateAndroid'),
					icon: {
						ios: 'star',
						android: 'star',
						web: 'Star'
					},
					onPress: () => {
						if (Platform.OS === 'android') {
							void Linking.openURL(
								'market://details?id=app.neuland&showAllReviews=true'
							)
						} else {
							void Linking.openURL(
								'itms-apps://apps.apple.com/app/neuland-next/id1617096811?action=write-review'
							)
						}
					}
				}
			]
		},

		{
			header: t('about.formlist.legal.title'),
			items: [
				{
					title: t('about.formlist.legal.button'),
					icon: {
						ios: 'hand.raised',
						android: 'privacy_tip',
						web: 'ShieldEllipsis'
					},
					onPress: () => {
						router.navigate('/legal')
					}
				}
			]
		}
	]

	// Use useRef instead of useState to prevent re-renders
	const pressCountRef = useRef(0)

	const handlePress = useCallback((): void => {
		pressCountRef.current += 1

		if (pressCountRef.current === 7) {
			if (Platform.OS !== 'web') {
				Alert.alert(
					t('about.easterEgg.title'),
					Platform.OS === 'ios'
						? t('about.easterEgg.message')
						: t('about.easterEgg.messageAndroid'),
					[
						{
							text: t('about.easterEgg.confirm'),
							style: 'cancel'
						}
					],
					{ cancelable: false }
				)
			} else {
				alert({
					title: t('about.easterEgg.title'),
					message: t('about.easterEgg.messageAndroid'),
					preset: 'done'
				})
			}
			const isCollected = unlockedAppIcons.includes('cat')
			if (!isCollected) {
				trackEvent('EasterEgg', { easterEgg: 'aboutLogo' })
				if (Platform.OS === 'ios') addUnlockedAppIcon('cat')
			}

			pressCountRef.current = 0
		}
	}, [t, unlockedAppIcons, addUnlockedAppIcon])

	const handleWebsitePress = (): void => {
		void Linking.openURL('https://neuland-ingolstadt.de/')
	}

	const handleContributorsPress = (): void => {
		const url = `https://next.neuland.app/${i18n.language === 'en' ? 'en/' : ''}about/contributors`
		void Linking.openURL(url)
	}

	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			<View style={styles.container}>
				<View style={styles.logoContainer}>
					<Pressable
						onPress={() => {
							if (Platform.OS !== 'web') {
								void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							}
							handlePress()
						}}
					>
						<View style={styles.logoIcon}>
							<Image
								// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
								source={require('@/assets/appIcons/default.png')}
								alt="Neuland Next Logo"
								style={styles.logoImage}
							/>
						</View>
					</Pressable>

					<View style={styles.logoTextContainer}>
						<View style={styles.appTitleContainer}>
							<Text style={styles.header}>{'Neuland Next'}</Text>
							<Text style={styles.text}>{'Native Version'}</Text>
						</View>
						<View>
							<Text style={styles.subHeader}>
								{t('about.header.developed')}
							</Text>
							<Pressable onPress={handleWebsitePress}>
								<Text style={styles.text} onPress={handleContributorsPress}>
									{'Neuland Ingolstadt e.V.'}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.formlistContainer}>
				<FormList sections={sections} />
			</View>
			<SectionView
				title={t('about.analytics.title')}
				footer={t('about.analytics.message')}
				link={{
					text: t('about.analytics.link'),
					destination: () => {
						void Linking.openURL(`${PRIVACY_URL}#Analytics`)
					}
				}}
			>
				<SingleSectionPicker
					title={t('about.analytics.toggle')}
					selectedItem={analyticsAllowed ?? false}
					action={setAnalyticsAllowed}
					state={analyticsAllowed ?? false}
				/>
			</SectionView>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	appTitleContainer: {
		marginBottom: 10
	},
	container: {
		paddingBottom: 20,
		paddingTop: 30
	},
	contentContainer: {
		paddingBottom: theme.margins.bottomSafeArea
	},
	formlistContainer: {
		alignSelf: 'center',
		marginTop: 10,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	},
	header: {
		color: theme.colors.text,
		fontSize: 22,
		fontWeight: 'bold'
	},
	logoContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-evenly'
	},
	logoIcon: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 9,
		boxShadow: `4 4 10 0 ${theme.colors.labelTertiaryColor}`
	},
	logoImage: {
		borderRadius: 9,
		flex: 1,
		height: 100,
		resizeMode: 'contain',
		width: 100
	},
	logoTextContainer: {
		flexDirection: 'column'
	},
	subHeader: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: 'bold'
	},
	text: {
		color: theme.colors.text,
		fontSize: 16
	}
}))
