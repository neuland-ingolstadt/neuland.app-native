import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import InfoBox from './info-box'

export default function EmployeeInfoSection(): React.JSX.Element {
	const { t } = useTranslation('settings')

	return (
		<View className="flex-row gap-2.5 mb-2.5">
			<View className="flex-1">
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
		</View>
	)
}
