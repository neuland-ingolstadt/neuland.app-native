import type { FeatureCollection } from 'geojson'
import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { MapContext } from '@/contexts/map'
import type { SelectMapElement } from '@/types/map'
import { formatFriendlyDate } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'
import Divider from '../Universal/divider'
import { NextLectureRow } from './next-lecture-row'

interface NextLectureSuggestionsProps {
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
}

const NextLectureSuggestion = ({
	allRooms,
	selectMapElement
}: NextLectureSuggestionsProps): React.JSX.Element | null => {
	const { nextLecture } = use(MapContext)
	const { t } = useTranslation('common')
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)
	const labelColor = toColor(useCSSVariable('--color-label'))

	if (nextLecture == null || nextLecture.length === 0) {
		return null
	}
	return (
		<View testID="map-next-lecture" className="mb-2.5">
			<View className="items-end flex-row justify-between mb-1">
				<Text className="text-text text-label-secondary ios:text-base ios:font-semibold android:text-[13px] android:font-normal android:uppercase web:text-base web:font-semibold mb-0.5 pt-2 text-left">
					{t('pages.map.details.room.nextLecture')}
				</Text>
				<Text
					className="text-[15px] font-medium pe-2.5 text-right"
					style={{ color: labelColor }}
				>
					{formatFriendlyDate(nextLecture[0].date)}
				</Text>
			</View>
			<View className="bg-card ios:rounded-[18px] android:rounded-lg web:rounded-lg overflow-hidden border-hairline border-border">
				{nextLecture.map((lecture, key) => (
					<React.Fragment key={key}>
						<NextLectureRow
							lecture={lecture}
							allRooms={allRooms}
							selectMapElement={selectMapElement}
							notificationColor={notificationColor}
						/>
						{key !== nextLecture.length - 1 && <Divider />}
					</React.Fragment>
				))}
			</View>
		</View>
	)
}

export default NextLectureSuggestion
