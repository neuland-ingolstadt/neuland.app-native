import WhatsNewBox from '@/components/Flow/WhatsnewBox'
import LoginForm from '@/components/Universal/LoginForm'
import { IMPRINT_URL, PRIVACY_URL } from '@/data/constants'
import type { OnboardingCardData } from '@/types/data'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { useFlowStore } from '@/hooks/useFlowStore'
import LoginAnimatedText from './LoginAnimatedText'

export default function Login(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('flow')
	const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)

	const navigateHome = (): void => {
		// on web there is no onboarding screen to enable analytics
		// if the user has not set any preferences, we can assume they want to enable analytics
		if (analyticsAllowed === undefined) {
			setAnalyticsAllowed(true)
		}
		router.replace('/')
	}

	const data: OnboardingCardData[] = [
		{
			title: t('onboarding.cards.title1'),
			description: t('onboarding.cards.description1'),
			icon: {
				ios: 'square.stack.3d.up',
				android: 'hub',
				web: 'Layers'
			}
		},
		{
			title: t('onboarding.cards.title2'),
			description: t('onboarding.cards.description2'),
			icon: {
				ios: 'person.2.gobackward',
				android: 'volunteer_activism',
				web: 'Users'
			}
		},
		{
			title: t('onboarding.cards.title4'),
			description: t('onboarding.cards.description4'),
			icon: {
				ios: 'person.3.fill',
				android: 'smartphone',
				web: 'Download'
			}
		},
		{
			title: t('onboarding.cards.title3'),
			description: t('onboarding.cards.description3'),
			icon: {
				ios: 'lock.app.dashed',
				android: 'encrypted',
				web: 'GlobeLock'
			}
		}
	]

	return (
		<>
			<ScrollView contentContainerStyle={styles.container}>
				<LoginAnimatedText />
				<View style={styles.innerContainer}>
					<LoginForm navigateHome={navigateHome} />
					<View style={styles.linkContainer}>
						<Text style={styles.privacyLink}>
							{t('onboarding.links.agree1')}
						</Text>
						<View style={styles.privacyContainer}>
							<Text
								style={styles.privacyLinkButton}
								onPress={() => {
									void Linking.openURL(PRIVACY_URL)
								}}
							>
								{t('onboarding.links.privacy')}
							</Text>
							<Text style={styles.privacyLink}>
								{t('onboarding.links.agree2')}
							</Text>
						</View>
					</View>
					<View style={styles.infoContainer}>
						{data.map((item, index) => (
							<WhatsNewBox
								key={index}
								title={item.title}
								description={item.description}
								icon={item.icon}
							/>
						))}
					</View>

					<View style={styles.faqContainer}>
						<Text
							style={styles.privacyLink}
							onPress={() => {
								void Linking.openURL(PRIVACY_URL)
							}}
						>
							{t('onboarding.links.faq')}
						</Text>
						<Text
							style={styles.privacyLink}
							onPress={() => {
								void Linking.openURL(IMPRINT_URL)
							}}
						>
							{t('onboarding.links.imprint')}
						</Text>
					</View>
				</View>
			</ScrollView>
		</>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignSelf: 'center',
		flex: 1,
		paddingTop: 20,
		width: '90%'
	},
	faqContainer: {
		alignItems: 'center',
		alignSelf: 'center',
		gap: 14,
		paddingBottom: theme.margins.bottomSafeArea
	},

	infoContainer: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: 24,
		gap: 16,
		maxWidth: 1000,
		padding: 24,
		marginTop: 40,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		width: '100%'
	},
	innerContainer: {
		flexDirection: 'column',
		gap: 40,
		paddingTop: 50
	},
	linkContainer: {
		alignItems: 'center',
		alignSelf: 'center'
	},
	privacyContainer: {
		flexDirection: 'row'
	},
	privacyLink: {
		color: theme.colors.labelColor,
		fontSize: 14,
		textAlign: 'center'
	},
	privacyLinkButton: {
		color: theme.colors.text,
		fontSize: 14,
		frontWeight: '800',
		textAlign: 'center'
	}
}))
