import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import LogoCardSVG from '@/components/Flow/svgs/logo-card'
import PlatformIcon from '@/components/Universal/icon'

export function MemberAreaButton(): React.JSX.Element | null {
	const router = useRouter()
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('settings')

	if (Platform.OS === 'web') {
		return null
	}

	return (
		<View style={styles.section}>
			<Text style={styles.sectionHeader}>{t('about.formlist.neuland')}</Text>
			<Pressable
				onPress={() => {
					router.navigate('/member')
				}}
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
						<LogoCardSVG size={70} opacity={0.35} color="#00ff3c" />
					</View>
					<View style={styles.cardRow}>
						<View style={styles.leftIconContainer}>
							<PlatformIcon
								ios={{
									name: 'person.crop.circle.badge.checkmark',
									size: 18
								}}
								android={{
									name: 'verified_user',
									size: 20
								}}
								web={{
									name: 'UserCheck',
									size: 20
								}}
								style={{ color: theme.colors.white }}
							/>
						</View>
						<View style={styles.contentContainer}>
							<Text style={styles.title}>{t('about.formlist.memberArea')}</Text>
						</View>
						<View style={styles.chevronContainer}>
							<PlatformIcon
								ios={{
									name: 'chevron.right',
									size: 10,
									weight: 'semibold'
								}}
								android={{
									name: 'chevron_right',
									size: 19
								}}
								web={{
									name: 'ChevronRight',
									size: 16
								}}
								style={{ color: theme.colors.white }}
							/>
						</View>
					</View>
				</LinearGradient>
			</Pressable>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	section: {
		gap: 6,
		width: '100%'
	},
	sectionHeader: {
		...(Platform.OS === 'ios'
			? {
					color: theme.colors.labelSecondaryColor,
					fontSize: 16,
					marginLeft: 18,
					fontWeight: '600'
				}
			: {
					color: theme.colors.labelSecondaryColor,
					fontSize: 13,
					fontWeight: 'normal',
					textTransform: 'uppercase'
				})
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
		right: 25,
		top: -5,
		pointerEvents: 'none',
		zIndex: 0
	},
	cardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 50,
		paddingVertical: 15,
		zIndex: 1
	},
	leftIconContainer: {
		width: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 16
	},
	contentContainer: {
		flex: 1,
		paddingLeft: 16,
		paddingRight: 8
	},
	title: {
		color: theme.colors.white,
		fontSize: 16,
		fontWeight: '500',
		lineHeight: 20,
		paddingRight: 8
	},
	chevronContainer: {
		marginRight: 16,
		alignItems: 'center',
		justifyContent: 'center',
		width: 22
	}
}))
