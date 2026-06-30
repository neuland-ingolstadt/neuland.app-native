import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PulsingDot from '@/components/Universal/pulsing-dot'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import type { TodayStats } from '@/utils/up-next-utils'

interface TodayStatsRowProps {
	stats: TodayStats
	nextEvent: React.ReactNode
}

export default function TodayStatsRow({
	stats,
	nextEvent
}: TodayStatsRowProps): React.JSX.Element | null {
	const successColor = toColor(useCSSVariable('--color-success'))
	const { t } = useTranslation('navigation')

	if (stats.total === 0) {
		return null
	}

	const statsText =
		stats.remaining > 0
			? t('cards.timetable.lecturesRemaining', { count: stats.remaining })
			: t('cards.timetable.noMoreLectures')

	return (
		<View className="mt-1 flex-col gap-2">
			{nextEvent}
			<Pressable
				className="flex-row items-center gap-2"
				onPress={() => router.navigate('/dots')}
				hitSlop={10}
			>
				<View className="flex-row gap-1.5 items-center flex-wrap">
					{Array.from({ length: stats.total }).map((_, index) =>
						index < stats.completed ? (
							<View
								key={index}
								className="w-2 h-2 rounded-sm bg-completed-dot"
							/>
						) : index < stats.completed + stats.ongoing ? (
							<PulsingDot
								key={index}
								style={{
									width: 8,
									height: 8,
									borderRadius: 4,
									backgroundColor: successColor
								}}
							/>
						) : (
							<View
								key={index}
								className="w-2 h-2 rounded-sm bg-soon-dot border-label"
								style={hairlineBorder}
							/>
						)
					)}
				</View>
				<Text className="text-label text-[13px]" numberOfLines={1}>
					{statsText}
				</Text>
			</Pressable>
		</View>
	)
}
