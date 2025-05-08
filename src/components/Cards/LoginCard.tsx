import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const LoginCard = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('navigation')
	return (
		<BaseCard title="login" onPressRoute="/login">
			<View style={styles.calendarView}>
				<View>
					<Text style={styles.eventTitle}>{t('cards.login.title')}</Text>
					<Text style={styles.eventDetails}>{t('cards.login.message')}</Text>
				</View>
			</View>
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	calendarView: {
		gap: 12,
		paddingTop: 10
	},
	eventDetails: {
		color: theme.colors.labelColor,
		fontSize: 15
	},
	eventTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500'
	}
}))

export default LoginCard
