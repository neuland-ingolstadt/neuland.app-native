import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
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
	const { t } = useTranslation('settings')

	return (
		<>
			<View className="flex-row gap-2.5 mb-2.5">
				<View className="flex-[5]">
					<InfoBox
						title={t('infoBoxes.gradesAndSubjects')}
						value={ects !== undefined ? `${ects} ECTS` : '-'}
						icon={{
							ios: 'chart.xyaxis.line',
							android: 'bar_chart',
							web: 'ChartColumnIncreasing'
						}}
						href={'/grades' as RelativePathString}
					/>
				</View>
				<View className="flex-[3]">
					<InfoBox
						title={t('infoBoxes.lecturers')}
						value={personalLecturersCount?.toString() ?? '-'}
						icon={{
							ios: 'person.2',
							android: 'group',
							web: 'Users'
						}}
						href={'/lecturers' as RelativePathString}
					/>
				</View>
			</View>
			<View className="flex-row gap-2.5 mb-2.5">
				<View className="flex-[3]">
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
					/>
				</View>
				<View className="flex-[5]">
					<InfoBox
						value={t('infoBoxes.library')}
						title={t('infoBoxes.view')}
						icon={{
							ios: 'books.vertical',
							android: 'book_5',
							web: 'Library'
						}}
						href={'/library' as RelativePathString}
					/>
				</View>
			</View>
		</>
	)
}
