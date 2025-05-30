import BottomSheet from '@/components/Layout/BottomSheet'
import {
	BottomSheetRootBackground,
	renderBackdrop
} from '@/components/Universal/BottomSheetRootBackground'
import '@react-navigation/elements'
import { Slot } from 'expo-router'
import type React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const unstable_settings = {
	initialRouteName: '/'
}

export default function Layout(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	if (typeof window === 'undefined') return <Slot />

	return (
		<BottomSheet
			screenOptions={{
				snapPoints: ['60%', '85%'],
				backgroundComponent: () => <BottomSheetRootBackground />,
				handleIndicatorStyle: styles.indicator,
				backdropComponent: renderBackdrop,
				enableDynamicSizing: true
			}}
		/>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	indicator: {
		backgroundColor: theme.colors.labelTertiaryColor
	}
}))
