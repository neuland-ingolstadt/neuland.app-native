import type React from 'react'
import { View } from 'react-native'
import { hairlineBorder } from '@/utils/uniwind-utils'

export default function Separator(): React.JSX.Element {
	return (
		<View className="bg-border my-[13px] ml-[60px]" style={hairlineBorder} />
	)
}
