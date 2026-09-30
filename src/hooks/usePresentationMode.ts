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
		top: 'soft' | 'hard'
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
	const isIos27Plus = Number.parseInt(Platform.Version, 10) >= 27

	if (DeviceInfo.getDeviceType() === 'Desktop') {
		return {
			presentation: 'modal'
		}
	}

	return {
		presentation: 'formSheet',
		sheetAllowedDetents: smallSheet ? [0.5, 0.7] : [0.7, 0.95],
		sheetInitialDetentIndex: 0,
		// iOS 26 needs the stronger native edge effect to obscure text behind the glass header.
		scrollEdgeEffects: isIos26Plus
			? { top: isIos27Plus ? 'soft' : 'hard' }
			: undefined,
		headerTransparent: isIos26Plus ? true : undefined,
		headerStyle: {
			backgroundColor: isIos26Plus ? 'transparent' : cardColor
		},
		contentStyle: {
			backgroundColor: isIos26Plus ? 'transparent' : backgroundColor
		}
	}
}
