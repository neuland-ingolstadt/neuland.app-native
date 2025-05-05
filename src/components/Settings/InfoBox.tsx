import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'
import type React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
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
}

const InfoBox = ({
	title,
	value,
	icon,
	onPress
}: InfoBoxProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<Pressable
			style={({ pressed }) => [
				styles.container,
				pressed && onPress ? { opacity: 0.8 } : {}
			]}
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.iconContainer}>
				<PlatformIcon
					ios={{
						name: icon.ios,
						size: 20,
						variant: icon.variant
					}}
					android={{
						name: icon.android,
						size: 22
					}}
					web={{
						name: icon.web,
						size: 20
					}}
					style={styles.icon}
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
		color: theme.colors.text
	},
	value: {
		color: theme.colors.text,
		fontSize: 18,
		fontWeight: 'bold'
	},
	title: {
		color: theme.colors.labelColor,
		fontSize: 13,
		marginTop: 4
	}
}))

export default InfoBox
