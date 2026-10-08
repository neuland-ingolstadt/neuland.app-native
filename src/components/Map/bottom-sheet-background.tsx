import type React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import { IosGlassSurface } from '@/components/Universal/ios-glass-surface'
import { toColor } from '@/utils/uniwind-utils'
import { surfaceCornersStyle } from './sheet-chrome'

const BottomSheetBackground = (): React.JSX.Element => {
	const { theme } = useUniwind()
	const dark = theme === 'dark'
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ??
			(dark ? 'rgb(1, 1, 1)' : 'rgb(242, 242, 242)')
	)

	if (Platform.OS === 'ios') {
		return (
			<IosGlassSurface
				pointerEvents="none"
				tinted={dark}
				style={[StyleSheet.absoluteFill, surfaceCornersStyle]}
				fallbackBackgroundColor={backgroundColor}
			/>
		)
	}

	return (
		<View
			pointerEvents="none"
			style={[
				StyleSheet.absoluteFill,
				surfaceCornersStyle,
				{ backgroundColor }
			]}
		/>
	)
}

export default BottomSheetBackground
