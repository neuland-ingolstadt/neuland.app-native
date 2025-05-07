import { useRouter } from 'expo-router'
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

	return (
		<>
			<View style={styles.infoBoxesContainer}>
				<InfoBox
					title="Printer Balance"
					value={printerBalance ?? '-'}
					icon={{
						ios: 'printer',
						android: 'print',
						web: 'Printer'
					}}
					onPress={() => router.navigate('/profile')}
				/>
				<InfoBox
					title="Grades & Subjects"
					value={ects !== undefined ? `${ects} ECTS` : '-'}
					icon={{
						ios: 'chart.bar',
						android: 'bar_chart',
						web: 'Activity'
					}}
					onPress={() => router.navigate('/grades')}
				/>
			</View>
			<View style={styles.infoBoxesContainer}>
				<InfoBox
					title="Lecturers"
					value={personalLecturersCount?.toString() ?? '-'}
					icon={{
						ios: 'person.2',
						android: 'group',
						web: 'Users'
					}}
					onPress={() => router.navigate('/lecturers')}
				/>
				<InfoBox
					title="Library"
					value="View"
					icon={{
						ios: 'barcode',
						android: 'qr_code_scanner',
						web: 'Barcode'
					}}
					onPress={() => router.navigate('/library-code')}
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
	}
}))
