import type * as AuthSession from 'expo-auth-session'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import LogoSVG from '../Flow/svgs/logo'
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
		<ScrollView
			style={styles.loggedOutPage}
			contentContainerStyle={styles.loggedOutContainer}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.welcomeCard}>
				<View style={styles.welcomeGradient}>
					<LogoSVG size={50} color={theme.colors.neulandGreen} />
					<Text style={styles.welcomeTitle}>{t('loggedOut.welcomeTitle')}</Text>
					<Text style={styles.welcomeSubtitle}>
						{t('loggedOut.welcomeSubtitle')}
					</Text>
				</View>
			</View>

			<Text style={styles.sectionTitle}>{t('loggedOut.sectionTitle')}</Text>

			<View style={styles.benefitCard}>
				<View style={styles.benefitIconContainer}>
					<PlatformIcon
						ios={{ name: 'person.3.fill', size: 18 }}
						android={{ name: 'group', size: 18 }}
						web={{ name: 'Users', size: 18 }}
						style={styles.benefitIcon}
					/>
				</View>
				<View style={styles.benefitTextContainer}>
					<Text style={styles.benefitTitle}>
						{t('loggedOut.benefits.community.title')}
					</Text>
					<Text style={styles.benefitDescription}>
						{t('loggedOut.benefits.community.description')}
					</Text>
				</View>
			</View>

			<View style={styles.benefitCard}>
				<View style={styles.benefitIconContainer}>
					<PlatformIcon
						ios={{ name: 'graduationcap.fill', size: 18 }}
						android={{ name: 'school', size: 18 }}
						web={{ name: 'GraduationCap', size: 18 }}
						style={styles.benefitIcon}
					/>
				</View>
				<View style={styles.benefitTextContainer}>
					<Text style={styles.benefitTitle}>
						{t('loggedOut.benefits.learning.title')}
					</Text>
					<Text style={styles.benefitDescription}>
						{t('loggedOut.benefits.learning.description')}
					</Text>
				</View>
			</View>

			<View style={styles.benefitCard}>
				<View style={styles.benefitIconContainer}>
					<PlatformIcon
						ios={{ name: 'network', size: 18 }}
						android={{ name: 'hub', size: 18 }}
						web={{ name: 'Network', size: 18 }}
						style={styles.benefitIcon}
					/>
				</View>
				<View style={styles.benefitTextContainer}>
					<Text style={styles.benefitTitle}>
						{t('loggedOut.benefits.networking.title')}
					</Text>
					<Text style={styles.benefitDescription}>
						{t('loggedOut.benefits.networking.description')}
					</Text>
				</View>
			</View>

			<View style={styles.benefitCard}>
				<View style={styles.benefitIconContainer}>
					<PlatformIcon
						ios={{ name: 'gamecontroller.fill', size: 18 }}
						android={{ name: 'sports_esports', size: 18 }}
						web={{ name: 'Gamepad2', size: 18 }}
						style={styles.benefitIcon}
					/>
				</View>
				<View style={styles.benefitTextContainer}>
					<Text style={styles.benefitTitle}>
						{t('loggedOut.benefits.fun.title')}
					</Text>
					<Text style={styles.benefitDescription}>
						{t('loggedOut.benefits.fun.description')}
					</Text>
				</View>
			</View>

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
	)
}
