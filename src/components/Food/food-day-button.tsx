import * as Haptics from 'expo-haptics'
import { memo, useCallback } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { Food } from '@/types/neuland-api'

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
		const { styles } = useStyles(stylesheet)
		const date = new Date(day.timestamp)

		const isFirstDay = index === 0
		const isLastDay = index === daysCount - 1
		const isSelected = selectedDay === index

		const buttonStyle = [
			{ flex: 1, marginHorizontal: 4 },
			isFirstDay ? { marginLeft: 0 } : null,
			isLastDay ? { marginRight: 0 } : null
		]

		const handlePress = useCallback(() => {
			if (Platform.OS === 'ios' && index !== selectedDay) {
				void Haptics.selectionAsync()
			}
			onDayPress(index)
		}, [index, onDayPress, selectedDay])

		return (
			<View style={buttonStyle}>
				<Pressable onPress={handlePress}>
					<View style={styles.dayButtonContainer}>
						<Text
							style={styles.dayText2(isSelected)}
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
							style={styles.dayText(isSelected)}
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

const stylesheet = createStyleSheet((theme) => ({
	dayButtonContainer: {
		alignContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		height: 60,
		justifyContent: 'space-evenly',
		paddingVertical: 8,
		width: '100%'
	},
	dayText: (selected: boolean) => ({
		color: selected ? theme.colors.primary : theme.colors.text,
		fontSize: 16,
		fontWeight: selected ? '500' : 'normal'
	}),
	dayText2: (selected: boolean) => ({
		color: selected ? theme.colors.primary : theme.colors.text,
		fontSize: 15,
		fontWeight: selected ? '500' : 'normal'
	})
}))
