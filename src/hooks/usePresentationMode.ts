import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

type PresentationMode = {
	presentation?: 'formSheet' | 'modal'
	sheetAllowedDetents?: number[]
	sheetInitialDetentIndex?: number
	sheetGrabberVisible?: boolean
	sheetCornerRadius?: number
	headerStyle?: {
		backgroundColor: string
	}
	headerTitleAlign?: 'center'
	contentStyle?: {
		backgroundColor: string
	}
}

export const usePresentationMode = (smallSheet = false): PresentationMode => {
	if (Platform.OS !== 'ios') {
		return {}
	}

	if (DeviceInfo.getDeviceType() === 'Desktop') {
		return {
			presentation: 'modal'
		}
	}

	return {
		presentation: 'formSheet',
		sheetAllowedDetents: smallSheet ? [0.5, 0.7] : [0.7, 0.95],
		sheetInitialDetentIndex: 0,
		headerStyle: {
			backgroundColor: 'transparent'
		},
		contentStyle: {
			backgroundColor: 'transparent'
		}
	}
}
