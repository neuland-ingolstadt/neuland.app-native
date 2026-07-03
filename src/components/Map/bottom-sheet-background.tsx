import { BlurView } from 'expo-blur'
import type React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

const BottomSheetBackground = (): React.JSX.Element => {
	const { theme } = useUniwind()
	const dark = theme === 'dark'
	const backgroundColor = toColor(useCSSVariable('--color-background'))
	const darkIos = 'rgba(0, 0, 0, 0.45)'
	const lightIos = 'rgba(200, 200, 200, 0.3)'

	return Platform.OS === 'ios' ? (
		<View
			className="absolute inset-0 overflow-hidden ios:rounded-t-[30px] android:rounded-t-lg web:rounded-t-lg"
			style={{
				backgroundColor: dark ? darkIos : lightIos
			}}
		>
			<BlurView
				intensity={85}
				style={StyleSheet.absoluteFillObject}
				tint={dark ? 'dark' : 'light'}
			/>
		</View>
	) : (
		<View
			className="absolute inset-0 overflow-hidden ios:rounded-t-[30px] android:rounded-t-lg web:rounded-t-lg"
			style={{ backgroundColor }}
		/>
	)
}

export default BottomSheetBackground
