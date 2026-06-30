import { router } from 'expo-router'
import type React from 'react'
import { useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from './icon'

interface ShareButtonProps {
	onPress: () => void | Promise<void>
	noShare?: boolean
}

const shareButtonStyle = {
	marginEnd: Platform.select({ android: -8, web: 14, ios: -12 }),
	padding: Platform.OS !== 'ios' ? 5 : 0,
	width:
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
			? 0
			: 30
} as const

export function ShareHeaderButton({
	onPress,
	noShare = false
}: ShareButtonProps): React.JSX.Element | undefined {
	const [copied, setCopied] = useState(false)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	if (noShare) return undefined
	return (
		<Pressable
			onPress={() => {
				void onPress()
				if (Platform.OS === 'web') {
					setCopied(true)
					setTimeout(() => setCopied(false), 1000)
				}
			}}
			style={shareButtonStyle}
		>
			<PlatformIcon
				ios={{
					name: copied ? 'checkmark' : 'square.and.arrow.up',
					size: 19,
					weight: 'bold'
				}}
				android={{ name: copied ? 'check' : 'share', size: 20 }}
				web={{ name: copied ? 'Check' : 'Share', size: 20 }}
				style={Platform.select({
					android: { marginRight: 2, color: textColor },
					ios: { marginBottom: 2, color: labelColor },
					default: undefined
				})}
			/>
		</Pressable>
	)
}

export const CloseHeaderButton = (): React.JSX.Element | undefined => {
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	if (Platform.OS !== 'ios') return undefined
	return (
		<Pressable onPress={() => router.back()} style={shareButtonStyle}>
			<PlatformIcon
				ios={{ name: 'xmark', size: 15, weight: 'semibold' }}
				android={{ name: 'close', size: 20 }}
				web={{ name: 'Cross', size: 20 }}
				style={Platform.select({
					android: { marginRight: 2, color: textColor },
					ios: { color: labelColor, marginLeft: 2 },
					default: undefined
				})}
			/>
		</Pressable>
	)
}
