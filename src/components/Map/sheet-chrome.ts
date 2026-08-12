import { Platform, type ViewStyle } from 'react-native'

export const SHEET_RADIUS = 30

export const sheetHostStyle: ViewStyle = {
	borderTopLeftRadius: SHEET_RADIUS,
	borderTopRightRadius: SHEET_RADIUS,
	overflow: 'hidden',
	...(Platform.OS === 'ios'
		? {
				backgroundColor: 'transparent',
				borderCurve: 'continuous'
			}
		: {})
}
