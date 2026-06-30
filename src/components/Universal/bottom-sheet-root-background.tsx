import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import type React from 'react'
import { Platform, StyleSheet, useColorScheme, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { toColor } from '@/utils/uniwind-utils'

function resolveActiveTheme(
	theme: string,
	colorScheme: 'light' | 'dark' | null | undefined
): 'light' | 'dark' {
	if (theme === 'light' || theme === 'dark') return theme
	return colorScheme === 'dark' ? 'dark' : 'light'
}

export const BottomSheetRootBackground = (): React.JSX.Element => {
	const darkIos = 'rgba(39, 39, 39, 0.4)'
	const lightIos = 'rgba(255, 255, 255, 0.5)'
	const themePreference = usePreferencesStore((state) => state.theme)
	const colorScheme = useColorScheme()
	const dark = resolveActiveTheme(themePreference, colorScheme) === 'dark'
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)

	return Platform.OS === 'ios' ? (
		<View
			className="absolute inset-0 rounded-t-lg overflow-hidden"
			style={{ backgroundColor: dark ? darkIos : lightIos }}
		>
			<BlurView
				intensity={dark ? 80 : 50}
				style={StyleSheet.absoluteFillObject}
				tint={dark ? 'dark' : 'light'}
			/>
		</View>
	) : (
		<View
			className="absolute inset-0 rounded-t-lg overflow-hidden"
			style={{ backgroundColor }}
		/>
	)
}

export const renderBackdrop = (
	props: BottomSheetBackdropProps
): React.JSX.Element => (
	<BottomSheetBackdrop
		{...props}
		appearsOnIndex={0}
		disappearsOnIndex={-1}
		opacity={0.3}
	/>
)
