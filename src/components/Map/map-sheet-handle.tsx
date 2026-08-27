import type React from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

export const MapSheetHandle = (): React.JSX.Element => {
	const color = toColor(useCSSVariable('--color-label-tertiary'))

	return (
		<View className="items-center pt-2 pb-1">
			<View
				className="h-1 w-9 rounded-full"
				style={{ backgroundColor: color }}
			/>
		</View>
	)
}
