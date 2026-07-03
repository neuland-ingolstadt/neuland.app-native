import * as Haptics from 'expo-haptics'
import { memo, useCallback } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import type { Food } from '@/types/neuland-api'
import { hairlineBorder } from '@/utils/uniwind-utils'

interface FoodDayButtonProps {
	day: Food
	index: number
	selectedDay: number
	daysCount: number
	language: string
	onDayPress: (index: number) => void
}

export const FoodDayButton = memo(
	({
		day,
		index,
		selectedDay,
		daysCount,
		language,
		onDayPress
	}: FoodDayButtonProps): React.JSX.Element => {
		const date = new Date(day.timestamp)

		const isFirstDay = index === 0
		const isLastDay = index === daysCount - 1
		const isSelected = selectedDay === index

		const handlePress = useCallback(() => {
			if (Platform.OS === 'ios' && index !== selectedDay) {
				void Haptics.selectionAsync()
			}
			onDayPress(index)
		}, [index, onDayPress, selectedDay])

		return (
			<View
				className="flex-1 mx-1"
				style={[
					isFirstDay ? { marginLeft: 0 } : undefined,
					isLastDay ? { marginRight: 0 } : undefined
				]}
			>
				<Pressable onPress={handlePress}>
					<View
						className="items-center self-center bg-card rounded-md border-border h-[60px] justify-evenly py-2 w-full"
						style={hairlineBorder}
					>
						<Text
							className={`text-[15px] ${
								isSelected
									? 'text-primary font-medium'
									: 'text-text font-normal'
							}`}
							adjustsFontSizeToFit
							minimumFontScale={0.8}
							numberOfLines={1}
						>
							{date
								.toLocaleDateString(language, {
									weekday: 'short'
								})
								.slice(0, 2)}
						</Text>
						<Text
							className={`text-base ${
								isSelected
									? 'text-primary font-medium'
									: 'text-text font-normal'
							}`}
							adjustsFontSizeToFit
							minimumFontScale={0.8}
							numberOfLines={1}
						>
							{date.toLocaleDateString('de-DE', {
								day: 'numeric',
								month: 'numeric'
							})}
						</Text>
					</View>
				</Pressable>
			</View>
		)
	}
)

FoodDayButton.displayName = 'FoodDayButton'
