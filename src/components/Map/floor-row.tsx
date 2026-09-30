import type React from 'react'
import { memo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { CELL, floorLabel } from './floor-picker-layout'

interface FloorRowProps {
	floor: string
	isCurrent: boolean
	isLast: boolean
	interactive: boolean
	borderColor: string
	cardColor: string
	textColor: string
	contrastColor: string
	glassChrome?: boolean
	onSelect: (floor: string) => void
}

export const FloorRow = memo(function FloorRow({
	floor,
	isCurrent,
	isLast,
	interactive,
	borderColor,
	cardColor,
	textColor,
	contrastColor,
	glassChrome = false,
	onSelect
}: FloorRowProps): React.JSX.Element {
	return (
		<Pressable
			testID={`map-floor-${floor}`}
			onPress={() => {
				onSelect(floor)
			}}
			disabled={!interactive}
			accessibilityRole="button"
			accessibilityState={{ selected: isCurrent }}
			accessibilityLabel={floorLabel(floor)}
			className="w-full items-center justify-center"
			style={{
				height: CELL,
				width: '100%',
				backgroundColor:
					glassChrome || (isCurrent && interactive) ? 'transparent' : cardColor,
				borderBottomColor: borderColor,
				borderBottomWidth: isLast || !interactive ? 0 : StyleSheet.hairlineWidth
			}}
		>
			<Text
				className="w-full text-center font-medium text-[15px]"
				style={{
					color: isCurrent && interactive ? contrastColor : textColor,
					fontVariant: ['tabular-nums'],
					includeFontPadding: false,
					textAlign: 'center'
				}}
			>
				{floorLabel(floor)}
			</Text>
		</Pressable>
	)
})
