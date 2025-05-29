import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'

export default function GuestInfoSection(): React.JSX.Element {
	const { t } = useTranslation('settings')
	const { styles } = useStyles(stylesheet)

	return (
		<Pressable
			style={styles.guestBanner}
			onPress={() => {
				router.navigate('/login')
			}}
		>
			<View style={styles.guestBannerContent}>
				<Text style={styles.guestBannerTitle}>
					{t('menu.guest.banner.title')}
				</Text>
				<Text style={styles.guestBannerMessage}>
					{t('menu.guest.banner.message')}
				</Text>
			</View>
			<View style={styles.iconContainer}>
				<PlatformIcon
					ios={{ name: 'sparkles', size: 24 }}
					android={{ name: 'auto_awesome', size: 28 }}
					web={{ name: 'Sparkles', size: 28 }}
					style={styles.guestBannerIcon}
				/>
			</View>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	guestBanner: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: theme.radius.mg,
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 16
	},
	guestBannerContent: {
		flex: 1
	},
	guestBannerTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4
	},
	guestBannerMessage: {
		color: theme.colors.labelColor,
		fontSize: 13,
		lineHeight: 18
	},
	iconContainer: {
		backgroundColor: `${theme.colors.secondary}20`,
		borderRadius: theme.radius.lg,
		padding: 12
	},
	guestBannerIcon: {
		color: theme.colors.secondary
	}
}))
