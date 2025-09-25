import { Link, type RelativePathString } from 'expo-router'
import type React from 'react'
import {
	Platform,
	Pressable,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'

interface InfoBoxProps {
	title: string
	value: string
	icon: {
		ios: string
		android: MaterialIcon
		web: LucideIcon
		variant?: 'fill' | 'outline'
	}
	style?: ViewStyle
	href: RelativePathString
	isExternalLink?: boolean
}

const InfoBox = ({
	title,
	value,
	icon,
	href,
	style,
	isExternalLink
}: InfoBoxProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<Link href={href} asChild style={[styles.container, style as TextStyle]}>
			<Pressable>
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
				<Text style={styles.title}>
					{title}
					{isExternalLink && Platform.OS !== 'android' && (
						<>
							<Text> </Text>
							<PlatformIcon
								ios={{ name: 'arrow.up.right', size: 5 }}
								android={{ name: 'search', size: 14 }}
								web={{ name: 'ArrowUpRight', size: 14 }}
								style={styles.externalLink}
							/>
						</>
					)}
				</Text>
			</Pressable>
		</Link>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.ios,
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
	},
	externalLink: {
		color: theme.colors.labelColor,
		marginBottom: Platform.OS === 'ios' ? -1 : -3
	}
}))

export default InfoBox
