import { BlurView } from 'expo-blur'
import type React from 'react'
import { Platform, StyleSheet, useColorScheme, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { toColor } from '@/utils/uniwind-utils'

const BottomSheetBackground = (): React.JSX.Element => {
	const themePreference = usePreferencesStore((state) => state.theme)
	const systemScheme = useColorScheme()
	const backgroundColor = useCSSVariable('--color-background')
	const isDark =
		themePreference === 'dark' ||
		(themePreference !== 'light' && systemScheme === 'dark')
	const darkIos = 'rgba(0, 0, 0, 0.45)'
	const lightIos = 'rgba(200, 200, 200, 0.3)'

	return Platform.OS === 'ios' ? (
		<View
			className="absolute inset-0 rounded-t-[30px] overflow-hidden"
			style={{
				backgroundColor: isDark ? darkIos : lightIos
			}}
		>
			<BlurView
				intensity={85}
				style={StyleSheet.absoluteFillObject}
				tint={isDark ? 'dark' : 'light'}
			/>
		</View>
	) : (
		<View
			className="absolute inset-0 rounded-t-[30px] overflow-hidden bg-background"
			style={{ backgroundColor: toColor(backgroundColor) }}
		/>
	)
}

export default BottomSheetBackground
