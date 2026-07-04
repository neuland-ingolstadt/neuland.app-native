import type React from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

export default function Separator(): React.JSX.Element {
	const borderColor = useCSSVariable('--color-border')

	return (
		<View
			style={{
				backgroundColor: toColor(borderColor),
				height: 1,
				marginLeft: 60,
				marginVertical: 13
			}}
		/>
	)
}
