import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import InfoBox from './InfoBox'

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
	const router = useRouter()
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
					onPress={() => router.navigate('/grades')}
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
					onPress={() => router.navigate('/lecturers')}
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
					onPress={() => router.navigate('/profile')}
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
					onPress={() => router.navigate('/library')}
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
