import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useCSSVariable } from 'uniwind'
import { isIos26OrLater } from '@/hooks/useTransparentHeader'
import { toColor } from '@/utils/uniwind-utils'

export type PresentationMode = {
	presentation?: 'formSheet' | 'modal'
	sheetAllowedDetents?: number[]
	sheetInitialDetentIndex?: number
	sheetGrabberVisible?: boolean
	sheetCornerRadius?: number
	scrollEdgeEffects?: {
		top: 'hard'
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

export type PresentationModeColors = {
	cardColor: string
	backgroundColor: string
}

/**
 * Pure form-sheet option builder used by `usePresentationMode`.
 *
 * On iOS 26+, Expo / React Navigation expect a transparent header + transparent
 * sheet content so UIKit can own Liquid Glass. Keep the top scroll-edge effect
 * on `hard`: `soft` (previously used for iOS 27) reads as a fully clear header
 * when content scrolls underneath, and `automatic` can leave long titles
 * visible behind the chrome.
 *
 * @see https://reactnavigation.org/docs/native-stack-navigator/#scrolledgeffects
 * @see .agents/skills/building-native-ui/references/form-sheet.md
 */
export const buildPresentationMode = (
	smallSheet: boolean,
	{
		platformOS = Platform.OS,
		ios26OrLater = isIos26OrLater(),
		deviceType = platformOS === 'ios' ? DeviceInfo.getDeviceType() : 'Handset',
		colors
	}: {
		platformOS?: typeof Platform.OS
		ios26OrLater?: boolean
		deviceType?: string
		colors: PresentationModeColors
	}
): PresentationMode => {
	if (platformOS !== 'ios') {
		return {}
	}

	if (deviceType === 'Desktop') {
		return {
			presentation: 'modal'
		}
	}

	return {
		presentation: 'formSheet',
		sheetAllowedDetents: smallSheet ? [0.5, 0.7] : [0.7, 0.95],
		sheetInitialDetentIndex: 0,
		...(ios26OrLater
			? {
					headerTransparent: true,
					headerStyle: { backgroundColor: 'transparent' },
					contentStyle: { backgroundColor: 'transparent' },
					scrollEdgeEffects: { top: 'hard' as const }
				}
			: {
					headerStyle: { backgroundColor: colors.cardColor },
					contentStyle: { backgroundColor: colors.backgroundColor }
				})
	}
}

export const usePresentationMode = (smallSheet = false): PresentationMode => {
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)

	return buildPresentationMode(smallSheet, {
		colors: { cardColor, backgroundColor }
	})
}
