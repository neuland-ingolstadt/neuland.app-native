import type * as AuthSession from 'expo-auth-session'
import type React from 'react'
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

	return (
		<ScrollView
			style={styles.loggedOutPage}
			contentContainerStyle={styles.loggedOutContainer}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.welcomeCard}>
				<View style={styles.welcomeGradient}>
					<LogoSVG size={50} color={theme.colors.neulandGreen} />
					<Text style={styles.welcomeTitle}>Welcome to Neuland</Text>
					<Text style={styles.welcomeSubtitle}>
						Your gateway to the THI student community
					</Text>
				</View>
			</View>

			<Text style={styles.sectionTitle}>Why Join Neuland?</Text>

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
					<Text style={styles.benefitTitle}>Community</Text>
					<Text style={styles.benefitDescription}>
						Connect with fellow students and build lasting friendships
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
					<Text style={styles.benefitTitle}>Learning</Text>
					<Text style={styles.benefitDescription}>
						Access workshops, tutorials, and study groups
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
					<Text style={styles.benefitTitle}>Networking</Text>
					<Text style={styles.benefitDescription}>
						Connect with industry professionals and alumni
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
					<Text style={styles.benefitTitle}>Fun</Text>
					<Text style={styles.benefitDescription}>
						Enjoy gaming nights, events, and social activities
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
					<Text style={styles.primaryButtonText}>Learn about the Club</Text>
				</Pressable>
				<Pressable
					disabled={!request}
					onPress={() => promptAsync()}
					style={({ pressed }) => [
						styles.secondaryButton,
						pressed && styles.buttonPressed
					]}
				>
					<Text style={styles.secondaryButtonText}>Sign In</Text>
				</Pressable>
			</View>
		</ScrollView>
	)
}
