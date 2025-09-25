import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useStyles } from 'react-native-unistyles'

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
	const styles = useStyles()
	if (Platform.OS !== 'ios') {
		return {}
	}

	const isIos26Plus =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26

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
			backgroundColor: isIos26Plus ? 'transparent' : styles.theme.colors.card
		},
		contentStyle: {
			backgroundColor: isIos26Plus
				? 'transparent'
				: styles.theme.colors.background
		}
	}
}
