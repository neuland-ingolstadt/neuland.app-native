import type React from 'react'
import { View } from 'react-native'

export default function DetailsSymbol({
	children
}: {
	children: React.JSX.Element
}): React.JSX.Element {
	return (
		<View className="flex-row w-[50px] justify-center items-center">
			{children}
		</View>
	)
}
