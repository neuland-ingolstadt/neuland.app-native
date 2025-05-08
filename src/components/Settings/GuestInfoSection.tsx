import PlatformIcon from '@/components/Universal/Icon'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function GuestInfoSection(): React.JSX.Element {
	const { t } = useTranslation('settings')
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.guestBanner}>
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
		</View>
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
		backgroundColor: `${theme.colors.primary}20`,
		borderRadius: theme.radius.lg,
		padding: 12
	},
	guestBannerIcon: {
		color: theme.colors.primary
	}
}))
