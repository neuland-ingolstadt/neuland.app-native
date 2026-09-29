import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useCSSVariable } from 'uniwind'
import { isIos26OrLater } from '@/hooks/useTransparentHeader'
import { toColor } from '@/utils/uniwind-utils'

type PresentationMode = {
	presentation?: 'formSheet' | 'modal'
	sheetAllowedDetents?: number[]
	sheetInitialDetentIndex?: number
	sheetGrabberVisible?: boolean
	sheetCornerRadius?: number
	scrollEdgeEffects?: {
		top: 'soft'
	}
	headerTransparent?: boolean
	headerStyle?: {
		backgroundColor: string
	}
	headerTitleAlign?: 'center'
	contentStyle?: {
		backgroundColor: string
	}
}

export const usePresentationMode = (smallSheet = false): PresentationMode => {
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)

	if (Platform.OS !== 'ios') {
		return {}
	}

	const isIos26Plus = isIos26OrLater()

	if (DeviceInfo.getDeviceType() === 'Desktop') {
		return {
			presentation: 'modal'
		}
	}

	return {
		presentation: 'formSheet',
		sheetAllowedDetents: smallSheet ? [0.5, 0.7] : [0.7, 0.95],
		sheetInitialDetentIndex: 0,
		// Let UIKit fade scrolling content behind the floating Liquid Glass header.
		scrollEdgeEffects: isIos26Plus ? { top: 'soft' } : undefined,
		headerTransparent: isIos26Plus ? true : undefined,
		headerStyle: {
			backgroundColor: isIos26Plus ? 'transparent' : cardColor
		},
		contentStyle: {
			backgroundColor: isIos26Plus ? 'transparent' : backgroundColor
		}
	}
}
