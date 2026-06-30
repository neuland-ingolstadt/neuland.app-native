import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import VerticalLine from '@/components/Universal/vertical-line'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

interface EventItemProps {
	title: string
	subtitle?: string
	startDateTime?: Date
	endDateTime?: Date
	timeLabel?: string
	location?: string
	showEndTime?: boolean
	subtitleTranslationKey?: string
	subtitleTranslationParams?: Record<string, string>
	color?: string
}

const EventItem = ({
	title,
	subtitle,
	startDateTime,
	endDateTime,
	timeLabel,
	location,
	showEndTime = false,
	subtitleTranslationKey,
	subtitleTranslationParams,
	color
}: EventItemProps): React.JSX.Element => {
	const secondaryColor = String(
		toColor(useCSSVariable('--color-secondary')) ?? '#0a61be'
	)
	const { t } = useTranslation('navigation')
	const resolvedTimeLabel =
		timeLabel ??
		(showEndTime && endDateTime && startDateTime && startDateTime < new Date()
			? t('cards.calendar.ends') + formatFriendlyRelativeTime(endDateTime)
			: startDateTime
				? formatFriendlyRelativeTime(startDateTime)
				: '')

	return (
		<View className="flex-row items-start">
			<VerticalLine color={color} />
			<View className="flex-1">
				<Text className="text-text text-[15px] font-bold" numberOfLines={1}>
					{title}
				</Text>
				{subtitle && (
					<Text className="text-label text-sm mt-0.5 mb-1" numberOfLines={1}>
						{subtitleTranslationKey && subtitleTranslationParams
							? (t as (key: string, params?: Record<string, string>) => string)(
									subtitleTranslationKey,
									subtitleTranslationParams
								)
							: subtitle}
					</Text>
				)}
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<PlatformIcon
							ios={{ name: 'clock', size: 11 }}
							android={{ name: 'schedule', size: 12, variant: 'outlined' }}
							web={{ name: 'Clock', size: 13 }}
							style={{ marginRight: 4, color: secondaryColor }}
						/>
						<Text className="text-label-secondary text-[13px] font-medium ms-0.5">
							{resolvedTimeLabel}
						</Text>
					</View>
					{location && (
						<View className="flex-row items-center max-w-[60%] shrink ml-2">
							<Text
								className="text-label-secondary text-[13px] mt-0.5 me-1"
								numberOfLines={1}
							>
								{location}
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	)
}

export default EventItem
