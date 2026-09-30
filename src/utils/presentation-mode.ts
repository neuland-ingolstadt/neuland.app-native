export type PresentationMode = {
	presentation?: 'formSheet' | 'modal'
	sheetAllowedDetents?: number[]
	sheetInitialDetentIndex?: number
	sheetGrabberVisible?: boolean
	sheetCornerRadius?: number
	scrollEdgeEffects?: {
		top: 'hard' | 'soft'
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

export type PresentationModeInput = {
	platformOS: string
	ios26OrLater: boolean
	deviceType: string
	cardColor: string
	backgroundColor: string
}

/**
 * Pure form-sheet option builder used by `usePresentationMode`.
 *
 * On iOS 26+, Expo / React Navigation expect a transparent header + transparent
 * sheet content so UIKit can own Liquid Glass. Use a soft top scroll-edge effect
 * so content can fade under the glass chrome without a hard cutoff.
 *
 * @see https://reactnavigation.org/docs/native-stack-navigator/#scrolledgeffects
 * @see .agents/skills/building-native-ui/references/form-sheet.md
 */
export const buildPresentationMode = (
	smallSheet: boolean,
	{
		platformOS,
		ios26OrLater,
		deviceType,
		cardColor,
		backgroundColor
	}: PresentationModeInput
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
					scrollEdgeEffects: { top: 'soft' as const }
				}
			: {
					headerStyle: { backgroundColor: cardColor },
					contentStyle: { backgroundColor: backgroundColor }
				})
	}
}
