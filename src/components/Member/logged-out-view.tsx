import type * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import LogoSVG from '../Flow/svgs/logo'
import { BenefitCard } from './benefit-card'

interface LoggedOutViewProps {
	request: AuthSession.AuthRequest | null
	promptAsync: () => void | Promise<void>
}

export function LoggedOutView({
	request,
	promptAsync
}: LoggedOutViewProps): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))
	const { t } = useTranslation('member')

	return (
		<SafeAreaProvider>
			<SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
				<ScrollView
					contentContainerClassName="p-page"
					showsVerticalScrollIndicator={false}
					contentInsetAdjustmentBehavior="automatic"
				>
					<View className="rounded-lg overflow-hidden mb-6">
						<View className="p-4 items-center bg-card">
							<LogoSVG size={55} color={String(textColor)} />
							<Text className="text-text text-[22px] font-bold mt-3">
								{t('loggedOut.welcomeTitle')}
							</Text>
							<Text className="text-label-secondary text-sm mt-1 text-center">
								{t('loggedOut.welcomeSubtitle')}
							</Text>
						</View>
					</View>

					<Text className="text-text text-xl font-bold mb-4">
						{t('loggedOut.sectionTitle')}
					</Text>

					<BenefitCard
						title={t('loggedOut.benefits.community.title')}
						description={t('loggedOut.benefits.community.description')}
						icon={{
							ios: { name: 'person.3.fill', size: 21 },
							android: { name: 'group', size: 18 },
							web: { name: 'Users', size: 18 }
						}}
					/>

					<BenefitCard
						title={t('loggedOut.benefits.learning.title')}
						description={t('loggedOut.benefits.learning.description')}
						icon={{
							ios: { name: 'graduationcap.fill', size: 18 },
							android: { name: 'school', size: 18 },
							web: { name: 'GraduationCap', size: 18 }
						}}
					/>

					<BenefitCard
						title={t('loggedOut.benefits.networking.title')}
						description={t('loggedOut.benefits.networking.description')}
						icon={{
							ios: { name: 'network', size: 21 },
							android: { name: 'hub', size: 18 },
							web: { name: 'Network', size: 18 }
						}}
					/>

					<BenefitCard
						title={t('loggedOut.benefits.fun.title')}
						description={t('loggedOut.benefits.fun.description')}
						icon={{
							ios: { name: 'gamecontroller.fill', size: 18 },
							android: { name: 'sports_esports', size: 18 },
							web: { name: 'Gamepad2', size: 18 }
						}}
					/>

					<View className="mt-8 gap-3">
						<Pressable
							onPress={() => Linking.openURL('https://neuland-ingolstadt.de')}
							className="bg-primary py-3 rounded-md items-center active:opacity-80"
						>
							<Text className="text-background text-base font-bold">
								{t('loggedOut.buttons.learnAboutClub')}
							</Text>
						</Pressable>
						<Pressable
							disabled={!request}
							onPress={() => {
								void promptAsync()
							}}
							className="bg-card py-3 border border-border rounded-md items-center active:opacity-80"
						>
							<Text className="text-primary text-base font-bold">
								{t('loggedOut.buttons.signIn')}
							</Text>
						</Pressable>
					</View>
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}
