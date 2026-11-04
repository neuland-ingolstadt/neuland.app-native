import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { Platform, Text, View } from 'react-native'
import PlatformIcon from '@/components/Universal/icon'
import RowEntry from '@/components/Universal/row-entry'
import i18n, { type LanguageKey } from '@/localization/i18n'
import type { Sports } from '@/types/university-sports'
import {
	CAMPUS_ENUM_TO_LABEL,
	sportsLocalizedTitle
} from '@/types/university-sports'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { getSportsCategoryIcons } from '@/utils/events-utils'

const SportsRow = ({ event }: { event: Sports }): React.JSX.Element => {
	const dateRange = formatFriendlyTimeRange(event.startTime, event.endTime)
	const icons = getSportsCategoryIcons(event.sportsCategory)

	return (
		<RowEntry
			testID="sports-event-row"
			title={sportsLocalizedTitle(event, i18n.language as LanguageKey)}
			href={`/events/sports/${event.id}` as RelativePathString}
			leftChildren={
				<View className="mt-0.5">
					<Text
						className="mb-1 text-sm font-medium text-label"
						numberOfLines={1}
					>
						{event.location}
					</Text>
					<Text className="text-[13px] text-label" numberOfLines={1}>
						{CAMPUS_ENUM_TO_LABEL[event.campus]}
					</Text>
				</View>
			}
			rightChildren={
				<View className="flex-row items-end justify-end gap-1.5 p-row">
					<Text className="text-sm text-label" numberOfLines={2}>
						{dateRange}
					</Text>
				</View>
			}
			icon={
				Platform.OS === 'web' ? undefined : (
					<PlatformIcon
						ios={{
							name: icons.iosIcon,
							size: 16
						}}
						android={{
							name: icons.androidIcon,
							size: 22
						}}
						web={{
							name: 'Dumbbell',
							size: 22
						}}
						style={{ alignSelf: 'center', marginRight: 4 }}
					/>
				)
			}
		/>
	)
}

export default SportsRow
