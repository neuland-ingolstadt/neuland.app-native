import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { t } from 'i18next'
import type React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import LogoSVG from '@/components/Flow/svgs/logo'
import LogoCardSVG from '@/components/Flow/svgs/logo-card'
import PlatformIcon from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import AvatarCircle from './avatar-circle'

const NeulandBox = (): React.JSX.Element | null => {
	const { styles, theme } = useStyles(stylesheet)
	const router = useRouter()
	const memberInfo = useMemberStore((s) => s.info)

	if (Platform.OS === 'web') {
		return null
	}

	if (!memberInfo) {
		return null
	}

	const hasHonoraryRole =
		memberInfo.groups?.some((group) =>
			group.toLowerCase().includes('ehrenmitglied')
		) ?? false

	return (
		<View style={styles.neulandContainer}>
			<Pressable
				onPress={() => router.navigate('/member')}
				style={({ pressed }) => [
					styles.container,
					{ opacity: pressed ? 0.9 : 1 }
				]}
			>
				<LinearGradient
					colors={['#000', '#015916']}
					start={{ x: -0.5, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={styles.gradient}
				>
					<View style={styles.watermark}>
						<LogoCardSVG size={110} opacity={0.35} color="#00ff3c" />
					</View>
					<View style={styles.neulandBoxContent}>
						<AvatarCircle
							background="rgba(0, 255, 60, 0.12)"
							size={50}
							style={styles.neulandAvatar}
						>
							<LogoSVG size={35} color={theme.colors.neulandGreen} />
						</AvatarCircle>

						<View style={styles.textContainer}>
							<Text style={styles.neulandName}>{memberInfo.name}</Text>
							<Text style={styles.neulandTitle}>
								{t(
									hasHonoraryRole
										? 'member:settings.honoraryTitle'
										: 'member:settings.title'
								)}
							</Text>
						</View>

						<PlatformIcon
							ios={{ name: 'chevron.right', size: 10, weight: 'semibold' }}
							android={{ name: 'chevron_right', size: 19 }}
							web={{ name: 'ChevronRight', size: 16 }}
							style={styles.neulandChevron}
						/>
					</View>
				</LinearGradient>
			</Pressable>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	neulandContainer: {
		marginTop: 10
	},
	container: {
		borderRadius: theme.radius.ios,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		overflow: 'hidden',
		width: '100%'
	},
	gradient: {
		overflow: 'hidden',
		position: 'relative',
		width: '100%'
	},
	watermark: {
		position: 'absolute',
		right: 18,
		top: -10,
		pointerEvents: 'none',
		zIndex: 0
	},
	neulandBoxContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		zIndex: 1
	},
	textContainer: {
		flex: 1,
		marginLeft: 16
	},
	neulandTitle: {
		color: theme.colors.white,
		fontSize: 12
	},
	neulandName: {
		color: theme.colors.white,
		fontSize: 18,
		fontWeight: 'bold',

		opacity: 0.9
	},
	neulandChevron: {
		color: theme.colors.white
	},
	neulandAvatar: {
		paddingRight: 3
	}
}))

export default NeulandBox
