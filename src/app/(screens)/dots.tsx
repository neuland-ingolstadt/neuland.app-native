import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useResolveClassNames } from 'uniwind'
import PulsingDot from '@/components/Universal/pulsing-dot'

export default function DotsExplanationScreen(): React.JSX.Element {
	const { t } = useTranslation('timetable')
	const dotOngoingStyle = useResolveClassNames(
		'w-3 h-3 rounded-[6px] mr-4 bg-success'
	)
	const smallDotOngoingStyle = useResolveClassNames(
		'w-2 h-2 rounded-[4px] mr-1 bg-success'
	)

	return (
		<View className="flex-1 px-page pt-2.5 pb-10">
			<View className="mt-1.5 px-page">
				<View className="flex-row items-center py-3">
					<View className="w-3 h-3 rounded-[6px] mr-4 bg-completed-dot" />
					<Text className="text-text text-base flex-1">
						{t('dots.completed')}
					</Text>
				</View>
				<View className="flex-row items-center py-3">
					<PulsingDot style={dotOngoingStyle} />
					<Text className="text-text text-base flex-1">
						{t('dots.ongoing')}
					</Text>
				</View>
				<View className="flex-row items-center py-3">
					<View className="w-3 h-3 rounded-[6px] mr-4 bg-soon-dot border border-label" />
					<Text className="text-text text-base flex-1">
						{t('dots.upcoming')}
					</Text>
				</View>

				<View className="flex-row items-center py-3 border-t border-border">
					<View className="flex-row mr-3 items-center">
						<View className="w-2 h-2 rounded-[4px] mr-1 bg-completed-dot" />
						<PulsingDot style={smallDotOngoingStyle} />
						<View className="w-2 h-2 rounded-[4px] mr-1 bg-soon-dot border border-label" />
					</View>

					<Text className="text-text text-base flex-1">{t('dots.total')}</Text>
				</View>
			</View>
		</View>
	)
}
