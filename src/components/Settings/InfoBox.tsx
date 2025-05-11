import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'
import type React from 'react'
import {
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
	type ViewStyle
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface InfoBoxProps {
	title: string
	value: string
	icon: {
		ios: string
		android: MaterialIcon
		web: LucideIcon
		variant?: 'fill' | 'outline'
	}
	onPress?: () => void
	style?: ViewStyle
}

const InfoBox = ({
	title,
	value,
	icon,
	onPress,
	style
}: InfoBoxProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<Pressable
			style={({ pressed }) => [
				styles.container,
				style,
				pressed && onPress ? { opacity: 0.8 } : {}
			]}
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.iconContainer}>
				<PlatformIcon
					ios={{
						name: icon.ios,
						size: 19,
						variant: icon.variant
					}}
					android={{
						name: icon.android,
						size: 24
					}}
					web={{
						name: icon.web,
						size: 21
					}}
					style={{ ...styles.icon }}
				/>
			</View>
			<Text style={styles.value}>{value}</Text>
			<Text style={styles.title}>{title}</Text>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		flex: 1,
		justifyContent: 'center',
		padding: 16,
		minHeight: 80
	},
	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 8
	},
	icon: {
		color: theme.colors.text,
		marginBottom: Platform.OS === 'android' ? -4 : 2
	},
	value: {
		color: theme.colors.text,
		fontSize: 17,
		fontWeight: 'bold'
	},
	title: {
		color: theme.colors.labelColor,
		fontSize: 13,
		marginTop: 4
	}
}))

export default InfoBox
