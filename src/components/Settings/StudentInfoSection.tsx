import type { GradeAverage } from '@/types/utils'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import InfoBox from './InfoBox'

interface StudentInfoSectionProps {
	gradeAverage?: GradeAverage
	printerBalance?: string
}

export default function StudentInfoSection({
	gradeAverage,
	printerBalance
}: StudentInfoSectionProps): React.JSX.Element {
	const router = useRouter()

	return (
		<>
			<View style={styles.infoBoxesContainer}>
				<InfoBox
					title="Grade Average"
					value={gradeAverage?.result ? `Ø ${gradeAverage.result}` : '-'}
					icon={{
						ios: 'chart.bar',
						android: 'bar_chart',
						web: 'BarChart'
					}}
					onPress={() => router.navigate('/grades')}
				/>
				<InfoBox
					title="Library Card"
					value="View"
					icon={{
						ios: 'barcode.viewfinder',
						android: 'qr_code_scanner',
						web: 'Barcode'
					}}
					onPress={() => router.navigate('/library-code')}
				/>
			</View>
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
			</View>
		</>
	)
}

const styles = {
	infoBoxesContainer: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 10
	}
}
