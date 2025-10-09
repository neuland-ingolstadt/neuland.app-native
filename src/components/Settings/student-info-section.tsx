import type { RelativePathString } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { printLink } from '@/data/constants'
import InfoBox from './info-box'

interface StudentInfoSectionProps {
	ects?: number
	printerBalance?: string
	personalLecturersCount?: number
}

export default function StudentInfoSection({
	ects,
	printerBalance,
	personalLecturersCount
}: StudentInfoSectionProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('settings')

	return (
		<>
			<View style={styles.infoBoxesContainer}>
				<InfoBox
					title={t('infoBoxes.gradesAndSubjects')}
					value={ects !== undefined ? `${ects} ECTS` : '-'}
					icon={{
						ios: 'chart.xyaxis.line',
						android: 'bar_chart',
						web: 'ChartColumnIncreasing'
					}}
					href={'/grades' as RelativePathString}
					style={styles.wideBox}
				/>
				<InfoBox
					title={t('infoBoxes.lecturers')}
					value={personalLecturersCount?.toString() ?? '-'}
					icon={{
						ios: 'person.2',
						android: 'group',
						web: 'Users'
					}}
					href={'/lecturers' as RelativePathString}
					style={styles.narrowBox}
				/>
			</View>
			<View style={styles.infoBoxesContainer}>
				<InfoBox
					title={t('infoBoxes.printerBalance')}
					value={printerBalance ?? '-'}
					icon={{
						ios: 'printer',
						android: 'print',
						web: 'Printer'
					}}
					href={printLink as RelativePathString}
					isExternalLink
					style={styles.narrowBox}
				/>

				<InfoBox
					value={t('infoBoxes.library')}
					title={t('infoBoxes.view')}
					icon={{
						ios: 'books.vertical',
						android: 'book_5',
						web: 'Library'
					}}
					href={'/library' as RelativePathString}
					style={styles.wideBox}
				/>
			</View>
		</>
	)
}

const stylesheet = createStyleSheet(() => ({
	infoBoxesContainer: {
		flexDirection: 'row' as const,
		gap: 10,
		marginBottom: 10
	},
	wideBox: {
		flex: 2
	},
	narrowBox: {
		flex: 1
	}
}))
