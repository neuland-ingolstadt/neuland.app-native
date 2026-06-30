import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import WhatsNewBox from '@/components/Flow/whats-new-box'
import LoginForm from '@/components/Universal/login-form'
import { IMPRINT_URL, PRIVACY_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { OnboardingCardData } from '@/types/data'
import { hairlineBorder } from '@/utils/uniwind-utils'
import LoginAnimatedText from './login-animated-text'
import LogoSVG from './svgs/logo'

export default function Login(): React.JSX.Element {
	const { t } = useTranslation('flow')
	const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)

	const navigateHome = (): void => {
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
			<View
				className="items-start w-full absolute top-0 left-0 right-0 z-[1] bg-card px-[4%] py-2.5 border-b border-border"
				style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
			>
				<View className="flex-row items-center gap-3">
					<LogoSVG size={32} />
					<View className="flex-col">
						<Text className="text-text text-xl font-semibold tracking-tight">
							Neuland Next
						</Text>
						<Text className="text-label text-sm font-normal tracking-tight">
							{t('login.title1Sub')}
						</Text>
					</View>
				</View>
			</View>
			<ScrollView contentContainerClassName="self-center flex-1 pt-5 w-[92%] mt-[100px]">
				<LoginAnimatedText />
				<View className="flex-col gap-10 pt-[50px]">
					<LoginForm navigateHome={navigateHome} />
					<View className="items-center self-center">
						<Text className="text-label text-sm text-center">
							{t('onboarding.links.agree1')}
						</Text>
						<View className="flex-row">
							<Text
								className="text-text text-sm text-center font-extrabold"
								onPress={() => {
									void Linking.openURL(PRIVACY_URL)
								}}
							>
								{t('onboarding.links.privacy')}
							</Text>
							<Text className="text-label text-sm text-center">
								{t('onboarding.links.agree2')}
							</Text>
						</View>
					</View>
					<View
						className="items-center self-center bg-card rounded-3xl gap-4 max-w-[1000px] p-6 mt-10 w-full"
						style={hairlineBorder}
					>
						{data.map((item, index) => (
							<WhatsNewBox
								key={index}
								title={item.title}
								description={item.description}
								icon={item.icon}
							/>
						))}
					</View>

					<View className="items-center self-center gap-3.5 pb-bottom-safe">
						<Text
							className="text-label text-sm text-center"
							onPress={() => {
								void Linking.openURL(PRIVACY_URL)
							}}
						>
							{t('onboarding.links.faq')}
						</Text>
						<Text
							className="text-label text-sm text-center"
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
