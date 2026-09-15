import type { PackedEvent } from '@howljs/calendar-kit'
import type React from 'react'
import { Text } from 'react-native'
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

	// Paint via calendar-kit's absoluteFill chrome (`event.color`). A nested
	// flex-1 View collapses under Reanimated header heights on New Arch.
	const background = String(event.color ?? calendarItemColor)

	return (
		<Text
			style={{
				fontSize: 12,
				fontWeight: '600',
				paddingHorizontal: 4,
				color: getContrastColor(background)
			}}
			numberOfLines={1}
			ellipsizeMode="tail"
		>
			{eventName}
		</Text>
	)
}

export default WeekHeaderEvent
