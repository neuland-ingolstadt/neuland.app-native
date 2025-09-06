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
	if (noShare) {
		return undefined
	}

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
					size: 16,
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

export function CloseButton(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	return (
		<Pressable
			onPress={() => {
				router.back()
			}}
			style={styles.shareButton}
		>
			<PlatformIcon
				ios={{
					name: 'xmark',
					size: 16,
					weight: 'bold'
				}}
				android={{
					name: 'expand_more',
					size: 20
				}}
				web={{
					name: 'Share',
					size: 20
				}}
				style={styles.iconClose}
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
				color: theme.colors.labelColor
			}
		})
	},
	iconClose: {
		...Platform.select({
			android: {
				color: theme.colors.text
			},
			ios: {
				color: theme.colors.labelColor
			}
		})
	},
	shareButton: {
		alignItems: 'center',
		alignSelf: 'center',

		justifyContent: 'center'
	}
}))
