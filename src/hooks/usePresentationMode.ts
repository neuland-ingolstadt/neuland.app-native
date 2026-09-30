import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useCSSVariable } from 'uniwind'
import { isIos26OrLater } from '@/hooks/useTransparentHeader'
import {
	buildPresentationMode,
	type PresentationMode
} from '@/utils/presentation-mode'
import { toColor } from '@/utils/uniwind-utils'

export type { PresentationMode } from '@/utils/presentation-mode'
export { buildPresentationMode } from '@/utils/presentation-mode'

export const usePresentationMode = (smallSheet = false): PresentationMode => {
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)

	return buildPresentationMode(smallSheet, {
		platformOS: Platform.OS,
		ios26OrLater: isIos26OrLater(),
		deviceType: DeviceInfo.getDeviceType(),
		cardColor,
		backgroundColor
	})
}
