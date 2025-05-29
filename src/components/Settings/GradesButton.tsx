import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '../Universal/Icon'

const GradesButton = (): React.JSX.Element => {
	const { t } = useTranslation('settings')
	const { styles } = useStyles(stylesheet)
	return (
		<Pressable
			onPress={() => {
				router.navigate('/grades')
			}}
			style={({ pressed }) => [
				{
					opacity: pressed ? 0.9 : 1
				},
				styles.pressableContainer
			]}
		>
			<View style={styles.cardRow}>
				<View style={styles.leftIconContainer}>
					<PlatformIcon
						ios={{
							name: 'book',
							size: 18
						}}
						android={{
							name: 'bar_chart_4_bars',
							size: 20
						}}
						web={{
							name: 'ChartColumnBig',
							size: 20
						}}
						style={styles.leftIcon}
					/>
				</View>

				<View style={styles.contentContainer}>
					<Text style={styles.rowTitle}>
						{t('profile.formlist.grades.button')}
					</Text>
				</View>

				<View style={styles.chevronContainer}>
					<PlatformIcon
						style={styles.chevronIcon}
						ios={{
							name: 'chevron.right',
							size: 14,
							weight: 'semibold'
						}}
						android={{
							name: 'chevron_right',
							size: 16
						}}
						web={{
							name: 'ChevronRight',
							size: 16
						}}
					/>
				</View>
			</View>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	pressableContainer: {
		width: '100%'
	},
	cardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15
	},
	leftIconContainer: {
		width: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 16
	},
	leftIcon: {
		color: theme.colors.text
	},
	contentContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 16,
		paddingRight: 8
	},
	rowTitle: {
		color: theme.colors.text,
		fontSize: 16,
		flexShrink: 1,
		paddingRight: 8
	},
	chevronContainer: {
		marginRight: 16,
		alignItems: 'center',
		justifyContent: 'center',
		width: 16
	},
	chevronIcon: {
		color: theme.colors.labelTertiaryColor
	}
}))

export default GradesButton
