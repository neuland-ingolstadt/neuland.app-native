import Color from 'color'
import { BlurView } from 'expo-blur'
import {
	GlassView,
	isGlassEffectAPIAvailable,
	isLiquidGlassAvailable
} from 'expo-glass-effect'
import type React from 'react'
import {
	Platform,
	type StyleProp,
	StyleSheet,
	View,
	type ViewProps,
	type ViewStyle
} from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

export function isIosLiquidGlassActive(): boolean {
	return (
		Platform.OS === 'ios' &&
		isLiquidGlassAvailable() &&
		isGlassEffectAPIAvailable()
	)
}

interface IosGlassSurfaceProps extends Pick<ViewProps, 'pointerEvents'> {
	children?: React.ReactNode
	style?: StyleProp<ViewStyle>
	isInteractive?: boolean
	fallbackBackgroundColor: string
}

export function IosGlassSurface({
	children,
	style,
	pointerEvents,
	isInteractive = false,
	fallbackBackgroundColor
}: IosGlassSurfaceProps): React.JSX.Element {
	const { theme } = useUniwind()
	const dark = theme === 'dark'
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const colorScheme = dark ? 'dark' : 'light'
	const tintColor = dark
		? 'rgba(0, 0, 0, 0.40)'
		: Color(cardColor).alpha(0.45).string()
	// Decorative chrome defaults to none; interactive surfaces must allow children
	// (Pressable / TextInput) to receive hits — otherwise GlassView swallows them.
	const resolvedPointerEvents =
		pointerEvents ?? (isInteractive ? 'auto' : 'none')

	if (Platform.OS !== 'ios') {
		return (
			<View
				pointerEvents={resolvedPointerEvents}
				style={[style, { backgroundColor: fallbackBackgroundColor }]}
			>
				{children}
			</View>
		)
	}

	if (isIosLiquidGlassActive()) {
		return (
			<GlassView
				pointerEvents={resolvedPointerEvents}
				isInteractive={isInteractive}
				glassEffectStyle="regular"
				colorScheme={colorScheme}
				tintColor={tintColor}
				style={style}
			>
				{children}
			</GlassView>
		)
	}

	return (
		<BlurView
			pointerEvents={resolvedPointerEvents}
			intensity={100}
			tint="systemChromeMaterial"
			style={style}
		>
			{children}
		</BlurView>
	)
}

export function iosGlassHairlineBorder(labelColor: string): ViewStyle {
	if (isIosLiquidGlassActive()) {
		return {}
	}

	return {
		borderColor: Color(labelColor).alpha(0.22).string(),
		borderWidth: StyleSheet.hairlineWidth
	}
}

export function iosGlassChromeBorder(
	borderColor: string,
	borderWidth = 1
): Pick<ViewStyle, 'borderColor' | 'borderWidth'> {
	if (isIosLiquidGlassActive()) {
		return { borderWidth: 0 }
	}

	return { borderColor, borderWidth }
}
