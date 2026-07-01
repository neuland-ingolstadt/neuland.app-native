import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { Platform, Text, View } from 'react-native'
import type { UniversitySportsFieldsFragment } from '@/__generated__/gql/graphql'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { sportsCategories } from '@/utils/events-utils'

import PlatformIcon from '../Universal/icon'
import RowEntry from '../Universal/row-entry'

const SportsRow = ({
	event
}: {
	event: UniversitySportsFieldsFragment
}): React.JSX.Element => {
	const dateRange = formatFriendlyTimeRange(event.startTime, event.endTime)

	return (
		<RowEntry
			title={event.title[i18n.language as LanguageKey] ?? ''}
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
						{event.campus}
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
							name: sportsCategories[event.sportsCategory].iosIcon,
							size: 16
						}}
						android={{
							name: sportsCategories[event.sportsCategory].androidIcon,
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
