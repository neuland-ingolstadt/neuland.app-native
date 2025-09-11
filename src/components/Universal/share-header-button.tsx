import { router } from 'expo-router'
import type React from 'react'
import { useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from './Icon'

interface ShareButtonProps {
	onPress: () => void | Promise<void>
	noShare?: boolean
}

export function ShareHeaderButton({
	onPress,
	noShare = false
}: ShareButtonProps): React.JSX.Element | undefined {
	const { styles } = useStyles(stylesheet)
	const [copied, setCopied] = useState(false)
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
			style={styles.shareButton}
		>
			<PlatformIcon
				ios={{
					name: copied ? 'checkmark' : 'square.and.arrow.up',
					size: 19,
					weight: 'bold'
				}}
				android={{
					name: copied ? 'check' : 'share',
					size: 20
				}}
				web={{
					name: copied ? 'Check' : 'Share',
					size: 20
				}}
				style={styles.icon}
			/>
		</Pressable>
	)
}

export const CloseHeaderButton = (): React.JSX.Element | undefined => {
	const { styles } = useStyles(stylesheet)
	if (Platform.OS !== 'ios') return undefined
	return (
		<Pressable onPress={() => router.back()} style={styles.shareButton}>
			<PlatformIcon
				ios={{
					name: 'xmark',
					size: 15,
					weight: 'semibold'
				}}
				android={{
					name: 'close',
					size: 20
				}}
				web={{
					name: 'Cross',
					size: 20
				}}
				style={styles.closeIcon}
			/>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	icon: {
		...Platform.select({
			android: {
				marginRight: 2,
				color: theme.colors.text
			},
			ios: {
				marginBottom: 2,
				color: theme.colors.labelColor
			}
		})
	},
	closeIcon: {
		...Platform.select({
			android: {
				marginRight: 2,
				color: theme.colors.text
			},
			ios: {
				color: theme.colors.labelColor,
				marginLeft: 2
			}
		})
	},
	shareButton: {
		marginEnd: Platform.select({
			android: -8,
			web: 14,
			ios: -12
		}),
		padding: Platform.OS !== 'ios' ? 5 : 0,
		width: Platform.OS !== 'ios' ? 30 : 0
	}
}))
