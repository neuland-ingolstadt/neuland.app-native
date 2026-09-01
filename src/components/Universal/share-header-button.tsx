import Color from 'color'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { router } from 'expo-router'
import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
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
	width: 30
} as const

const iosGlassButtonStyle = {
	alignItems: 'center',
	borderRadius: 22,
	height: 44,
	justifyContent: 'center',
	overflow: 'hidden',
	width: 44
} as const

interface IosGlassHeaderButtonProps {
	icon: 'close' | 'share'
	label: string
	onPress: () => void | Promise<void>
}

export function IosGlassHeaderButton({
	icon,
	label,
	onPress
}: IosGlassHeaderButtonProps): React.JSX.Element {
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const glassStyle = [
		iosGlassButtonStyle,
		{
			borderColor: Color(labelColor).alpha(0.22).string(),
			borderWidth: StyleSheet.hairlineWidth
		}
	]
	const button = (
		<Pressable
			testID={`${icon}-header-button`}
			accessible
			accessibilityRole="button"
			accessibilityLabel={label}
			onPress={() => void onPress()}
			style={iosGlassButtonStyle}
		>
			<PlatformIcon
				ios={{
					name: icon === 'share' ? 'square.and.arrow.up' : 'xmark',
					size: icon === 'share' ? 19 : 15,
					weight: icon === 'share' ? 'bold' : 'semibold'
				}}
				android={{ name: icon === 'share' ? 'share' : 'close', size: 20 }}
				web={{ name: icon === 'share' ? 'Share' : 'X', size: 20 }}
				style={{ color: labelColor }}
			/>
		</Pressable>
	)

	if (Platform.OS === 'ios' && isGlassEffectAPIAvailable()) {
		return (
			<GlassView
				glassEffectStyle="regular"
				isInteractive
				style={glassStyle}
				tintColor={Color(cardColor).alpha(0.45).string()}
			>
				{button}
			</GlassView>
		)
	}

	return (
		<View style={[glassStyle, { backgroundColor: cardColor }]}>{button}</View>
	)
}

export function ShareHeaderButton({
	onPress,
	noShare = false
}: ShareButtonProps): React.JSX.Element | undefined {
	const { t } = useTranslation(['accessibility'])
	const [copied, setCopied] = useState(false)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	if (noShare) return undefined
	return (
		<Pressable
			testID="share-header-button"
			accessible
			accessibilityRole="button"
			accessibilityLabel={t('button.share')}
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
	const { t } = useTranslation(['accessibility'])
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	if (Platform.OS !== 'ios') return undefined
	return (
		<Pressable
			testID="close-header-button"
			accessible
			accessibilityRole="button"
			accessibilityLabel={t('button.close')}
			onPress={() => router.back()}
			style={shareButtonStyle}
		>
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
