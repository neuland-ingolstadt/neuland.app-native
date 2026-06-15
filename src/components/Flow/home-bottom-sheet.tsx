import { BottomSheetView } from '@gorhom/bottom-sheet'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const HomeBottomSheet = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
	return (
		<BottomSheetView style={styles.contentContainer}>
			<View>
				<Text style={styles.text}>{t('reportProblem')}</Text>
			</View>
		</BottomSheetView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	contentContainer: {
		flex: 1,
		paddingHorizontal: theme.margins.page
	},
	text: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600'
	}
}))
