import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import InfoBox from './info-box'

export default function EmployeeInfoSection(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('settings')

	return (
		<View style={styles.infoBoxesContainer}>
			<InfoBox
				title={t('infoBoxes.open')}
				value={t('infoBoxes.lecturers')}
				icon={{
					ios: 'person.2',
					android: 'group',
					web: 'Users'
				}}
				href={'/lecturers' as RelativePathString}
			/>
		</View>
	)
}

const stylesheet = createStyleSheet(() => ({
	infoBoxesContainer: {
		flexDirection: 'row' as const,
		gap: 10,
		marginBottom: 10
	}
}))
