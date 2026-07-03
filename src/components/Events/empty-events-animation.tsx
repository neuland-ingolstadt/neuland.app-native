import type React from 'react'

import { Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { CalendarAnimation } from './calendar-animation'

/**
 * An enhanced empty state component for the events screens that displays
 * a polished animation and guidance for the user.
 */
export const EmptyEventsAnimation = ({
	title,
	subtitle
}: {
	title: string
	subtitle: string
}): React.JSX.Element => {
	return (
		<Animated.View
			className="flex-1 items-center justify-start w-full px-5 pt-[100px] pb-2.5"
			entering={FadeIn.duration(600).delay(300)}
		>
			<View className="w-full max-w-[480px] items-center py-2">
				<View className="mb-10 items-center">
					<CalendarAnimation size={130} />
				</View>

				<View className="items-center w-full">
					<Text className="text-text text-2xl font-bold mb-3 text-center">
						{title}
					</Text>
					<Text className="text-label text-base text-center mb-6 leading-[22px] max-w-[90%]">
						{subtitle}
					</Text>
				</View>
			</View>
		</Animated.View>
	)
}
