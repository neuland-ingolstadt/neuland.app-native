import type * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'
import LogoSVG from '../Flow/svgs/logo'
import { BenefitCard } from './benefit-card'
import { stylesheet } from './styles'

interface LoggedOutViewProps {
	request: AuthSession.AuthRequest | null
	promptAsync: () => void
}

export function LoggedOutView({
	request,
	promptAsync
}: LoggedOutViewProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('member')

	return (
		<SafeAreaView>
			<ScrollView
				style={styles.loggedOutPage}
				contentContainerStyle={styles.loggedOutContainer}
				showsVerticalScrollIndicator={false}
				contentInsetAdjustmentBehavior="automatic"
			>
				<View style={styles.welcomeCard}>
					<View style={styles.welcomeGradient}>
						<LogoSVG size={55} color={theme.colors.text} />
						<Text style={styles.welcomeTitle}>
							{t('loggedOut.welcomeTitle')}
						</Text>
						<Text style={styles.welcomeSubtitle}>
							{t('loggedOut.welcomeSubtitle')}
						</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>{t('loggedOut.sectionTitle')}</Text>

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

				<View style={styles.buttonContainer}>
					<Pressable
						onPress={() => Linking.openURL('https://neuland-ingolstadt.de')}
						style={({ pressed }) => [
							styles.primaryButton,
							pressed && styles.buttonPressed
						]}
					>
						<Text style={styles.primaryButtonText}>
							{t('loggedOut.buttons.learnAboutClub')}
						</Text>
					</Pressable>
					<Pressable
						disabled={!request}
						onPress={() => promptAsync()}
						style={({ pressed }) => [
							styles.secondaryButton,
							pressed && styles.buttonPressed
						]}
					>
						<Text style={styles.secondaryButtonText}>
							{t('loggedOut.buttons.signIn')}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
