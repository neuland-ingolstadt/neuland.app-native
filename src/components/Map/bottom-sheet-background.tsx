import type { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import type React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

const SHEET_RADIUS = 30
const sheetLayout = {
	...StyleSheet.absoluteFillObject,
	borderTopLeftRadius: SHEET_RADIUS,
	borderTopRightRadius: SHEET_RADIUS,
	overflow: 'hidden' as const
}

const BottomSheetBackground = ({
	pointerEvents,
	style
}: BottomSheetBackgroundProps): React.JSX.Element => {
	const { theme } = useUniwind()
	const dark = theme === 'dark'
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ??
			(dark ? 'rgb(1, 1, 1)' : 'rgb(242, 242, 242)')
	)
	const darkIos = 'rgba(0, 0, 0, 0.45)'
	const lightIos = 'rgba(200, 200, 200, 0.3)'

	if (Platform.OS === 'ios') {
		return (
			<View
				pointerEvents={pointerEvents}
				style={[sheetLayout, { backgroundColor: dark ? darkIos : lightIos }]}
			>
				<BlurView
					intensity={85}
					style={StyleSheet.absoluteFillObject}
					tint={dark ? 'dark' : 'light'}
				/>
			</View>
		)
	}

	return (
		<View
			pointerEvents={pointerEvents}
			style={[sheetLayout, style, { backgroundColor }]}
		/>
	)
}

export default BottomSheetBackground
