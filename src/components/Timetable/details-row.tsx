import type React from 'react'
import { View } from 'react-native'

export default function DetailsRow({
	children
}: {
	children: React.JSX.Element[]
}): React.JSX.Element {
	return <View className="flex-row gap-3">{children}</View>
}
