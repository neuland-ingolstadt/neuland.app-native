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
}

export const usePresentationMode = (): PresentationMode => {
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
		sheetAllowedDetents: [0.7, 1],
		sheetInitialDetentIndex: 0,
		sheetCornerRadius: 30,
		headerStyle: {
			backgroundColor: 'transparent'
		}
	}
}
