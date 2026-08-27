import { BlurView } from 'expo-blur'
import {
	GlassView,
	isGlassEffectAPIAvailable,
	isLiquidGlassAvailable
} from 'expo-glass-effect'
import type React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import { SHEET_RADIUS } from './sheet-chrome'

const surfaceCorners = {
	borderTopLeftRadius: SHEET_RADIUS,
	borderTopRightRadius: SHEET_RADIUS,
	overflow: 'hidden' as const,
	...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : {})
}

const BottomSheetBackground = (): React.JSX.Element => {
	const { theme } = useUniwind()
	const dark = theme === 'dark'
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ??
			(dark ? 'rgb(1, 1, 1)' : 'rgb(242, 242, 242)')
	)

	if (Platform.OS === 'ios') {
		const colorScheme = dark ? 'dark' : 'light'

		if (isLiquidGlassAvailable() && isGlassEffectAPIAvailable()) {
			return (
				<GlassView
					pointerEvents="none"
					glassEffectStyle="regular"
					colorScheme={colorScheme}
					style={[StyleSheet.absoluteFill, surfaceCorners]}
				/>
			)
		}

		return (
			<BlurView
				pointerEvents="none"
				intensity={100}
				tint="systemChromeMaterial"
				style={[StyleSheet.absoluteFill, surfaceCorners]}
			/>
		)
	}

	return (
		<View
			pointerEvents="none"
			style={[StyleSheet.absoluteFill, surfaceCorners, { backgroundColor }]}
		/>
	)
}

export default BottomSheetBackground
