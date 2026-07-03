import type React from 'react'
import { View } from 'react-native'

export default function DetailsBody({
	children
}: {
	children: React.JSX.Element | React.JSX.Element[]
}): React.JSX.Element {
	return (
		<View className="flex-col justify-center items-start shrink gap-1">
			{children}
		</View>
	)
}
