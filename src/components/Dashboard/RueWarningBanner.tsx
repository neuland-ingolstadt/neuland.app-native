import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import { primussLink } from '@/data/constants'
import { useRueWarningStore } from '@/hooks/useRueWarningStore'

interface RueWarningBannerProps {
	eventId: string | undefined
}

export default function RueWarningBanner({
	eventId
}: RueWarningBannerProps): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])
	const dismissedEventId = useRueWarningStore((state) => state.dismissedEventId)
	const dismiss = useRueWarningStore((state) => state.dismiss)

	if (eventId == null || dismissedEventId === eventId) {
		return null
	}

	return (
		<View style={styles.card}>
			<View style={styles.contentWrapper}>
				<View style={styles.titleView}>
					<View style={styles.iconContainer}>
						<PlatformIcon
							ios={{ name: 'exclamationmark.triangle.fill', size: 15 }}
							android={{ name: 'warning', size: 23, variant: 'filled' }}
							web={{ name: 'Triangle', size: 20 }}
							style={styles.icon}
						/>
					</View>
					<Text style={styles.title}>
						{t('dashboard.rueWarning.title', { ns: 'settings' })}
					</Text>
					<Pressable
						onPress={() => dismiss(eventId)}
						hitSlop={10}
						style={styles.closeButton}
					>
						<PlatformIcon
							ios={{ name: 'xmark', size: 16 }}
							android={{ name: 'close', size: 24 }}
							web={{ name: 'X', size: 20 }}
							style={styles.closeIcon}
						/>
					</Pressable>
				</View>
				<View style={styles.contentContainer}>
					<Text style={styles.description}>
						{t('dashboard.rueWarning.message', { ns: 'settings' })}
					</Text>
				</View>
				<Pressable
					onPress={() => {
						void Linking.openURL(primussLink)
					}}
					style={styles.linkArea}
				>
					<Text style={styles.linkText}>
						{t('dashboard.rueWarning.link', {
							ns: 'settings',
							defaultValue: 'Mehr erfahren'
						})}
					</Text>
				</Pressable>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: 1,
		borderRadius: theme.radius.lg,
		marginHorizontal: theme.margins.page,
		marginVertical: 6,
		width: 'auto',
		overflow: 'hidden'
	},
	contentWrapper: {
		padding: theme.margins.card
	},
	closeButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	closeIcon: {
		color: theme.colors.labelColor,
		opacity: 0.7
	},
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: `${theme.colors.warning}20`,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 4
	},
	icon: {
		color: theme.colors.warning
	},
	titleView: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 10
	},
	title: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 17,
		fontWeight: '600',
		paddingBottom: 0
	},
	contentContainer: {
		flexDirection: 'row',
		gap: theme.margins.card,
		alignItems: 'flex-start'
	},
	description: {
		color: theme.colors.text,
		fontSize: 15,
		marginTop: 12,
		flex: 1
	},
	linkArea: {
		marginTop: 12,
		alignSelf: 'flex-end',
		paddingVertical: 0,
		paddingHorizontal: 0
	},
	linkText: {
		color: theme.colors.labelColor,
		fontSize: 12,
		textAlign: 'right',
		marginTop: 0
	}
}))
