import type React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function DotsExplanationScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('timetable')

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Text style={styles.headerText}>{t('dots.title')}</Text>
			</View>

			<View style={styles.explanationContainer}>
				<View style={styles.dotExplanationRow}>
					<View style={[styles.dot, styles.dotCompleted]} />
					<Text style={styles.explanationText}>{t('dots.completed')}</Text>
				</View>
				<View style={styles.dotExplanationRow}>
					<View style={[styles.dot, styles.dotOngoing]} />
					<Text style={styles.explanationText}>{t('dots.ongoing')}</Text>
				</View>
				<View style={styles.dotExplanationRow}>
					<View style={[styles.dot, styles.dotRemaining]} />
					<Text style={styles.explanationText}>{t('dots.upcoming')}</Text>
				</View>

				<View style={[styles.dotExplanationRow, styles.totalExplanationRow]}>
					<View style={styles.dotsGroup}>
						<View style={[styles.dot, styles.smallDot, styles.dotCompleted]} />
						<View style={[styles.dot, styles.smallDot, styles.dotOngoing]} />
						<View style={[styles.dot, styles.smallDot, styles.dotRemaining]} />
					</View>

					<Text style={styles.explanationText}>{t('dots.total')}</Text>
				</View>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		paddingHorizontal: theme.margins.page,

		paddingTop: 10,
		paddingBottom: 16
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start'
	},
	headerText: {
		color: theme.colors.text,
		fontSize: 23,
		fontWeight: '600',
		marginBottom: 16
	},
	explanationContainer: {
		marginTop: 5,
		paddingHorizontal: theme.margins.page
	},
	dotExplanationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12
	},
	totalExplanationRow: {
		paddingVertical: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: theme.colors.border
	},
	explanationText: {
		color: theme.colors.text,
		fontSize: 16,
		flex: 1
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 16
	},
	smallDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 4
	},
	dotCompleted: {
		backgroundColor: theme.colors.success
	},
	dotOngoing: {
		backgroundColor: theme.colors.success,
		opacity: 0.6
	},
	dotRemaining: {
		backgroundColor: theme.colors.soonDot,
		borderColor: theme.colors.labelColor,
		borderWidth: 1
	},
	dotsGroup: {
		flexDirection: 'row',
		marginRight: 12,
		alignItems: 'center'
	}
}))
