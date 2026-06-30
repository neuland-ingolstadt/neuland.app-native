import type { PackedEvent } from '@howljs/calendar-kit'
import type React from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

const WeekHeaderEvent = ({
	event
}: {
	event: PackedEvent
}): React.JSX.Element | null => {
	const calendarItemColor = String(
		toColor(useCSSVariable('--color-calendar-item')) ?? '#5d5d5d'
	)

	const eventName = event?.name ?? event?.title ?? ''
	if (!eventName) {
		return null
	}

	return (
		<View
			className="-mx-0.5 -my-px px-1.5 flex-1 justify-center"
			style={{ backgroundColor: calendarItemColor }}
		>
			<Text
				className="text-xs font-semibold"
				style={{ color: getContrastColor(calendarItemColor) }}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{eventName}
			</Text>
		</View>
	)
}

export default WeekHeaderEvent
