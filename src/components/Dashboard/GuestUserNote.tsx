import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'

export default function GuestUserNote(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])

	return (
		<Pressable
			style={[styles.card, styles.noteContainer]}
			onPress={() => {
				router.navigate('/login')
			}}
		>
			<View style={styles.noteTextContainer}>
				<PlatformIcon
					ios={{
						name: 'lock',
						size: 20
					}}
					android={{
						name: 'lock',
						size: 24
					}}
					web={{
						name: 'Lock',
						size: 24
					}}
				/>
				<Text style={styles.notesTitle}>
					{t('dashboard.unavailable.title')}
				</Text>
			</View>

			<Text style={styles.notesMessage}>
				{t('dashboard.unavailable.message')}
			</Text>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	card: {
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		paddingHorizontal: 0
	},
	noteContainer: {
		backgroundColor: theme.colors.card,
		marginTop: 3,
		paddingHorizontal: 12
	},
	noteTextContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
		justifyContent: 'flex-start',
		paddingTop: 12,
		paddingVertical: 9
	},
	notesMessage: {
		color: theme.colors.text,
		fontSize: 15,
		marginBottom: 12,
		textAlign: 'left'
	},
	notesTitle: {
		color: theme.colors.primary,
		fontSize: 17,
		fontWeight: '600',
		textAlign: 'left'
	}
}))
