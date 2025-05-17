import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface ResetOrderButtonProps {
	hasUserDefaultOrder: boolean
	onPress: () => void
}

export default function ResetOrderButton({
	hasUserDefaultOrder,
	onPress
}: ResetOrderButtonProps): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])

	if (hasUserDefaultOrder) {
		return null
	}

	return (
		<View style={[styles.card, styles.blockContainer]}>
			<Pressable onPress={onPress}>
				<Text style={styles.reset}>{t('dashboard.reset')}</Text>
			</Pressable>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	card: {
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		paddingHorizontal: 0
	},
	blockContainer: {
		backgroundColor: theme.colors.card,
		marginTop: 6
	},
	reset: {
		fontSize: 16,
		marginVertical: 13,
		alignSelf: 'center',
		color: theme.colors.notification
	}
}))
