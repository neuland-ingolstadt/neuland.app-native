import type { MaterialIcon } from '@/types/material-icons'
import type { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon, { type LucideIcon } from '../Universal/Icon'

interface WhatsNewBoxProps {
	title: string
	description: string
	icon: { ios: string; android: MaterialIcon; web: LucideIcon }
}

/**
 * A component that renders a box with a title, description and an icon.
 * @param {string} title - The title of the box.
 * @param {string} description - The description of the box.
 * @param {string} icon - The icon of the box.
 * @returns {JSX.Element} - A React component that renders the box.
 * @example
 * <WhatsNewBox title="Title" description="Description" icon="chevron-forward-circle" />
 */
const WhatsNewBox: FC<WhatsNewBoxProps> = ({ title, description, icon }) => {
	const { styles } = useStyles(stylesheet)
	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<PlatformIcon
					ios={{
						name: icon.ios,
						size: 26,
						variableValue: 1
					}}
					android={{
						name: icon.android,
						size: 28
					}}
					web={{
						name: icon.web,
						size: 28
					}}
				/>
			</View>

			<View style={styles.textContainer}>
				<Text style={styles.title} numberOfLines={2}>
					{title}
				</Text>
				<Text
					style={styles.description}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={4}
				>
					{description}
				</Text>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		backgroundColor: theme.colors.cardContrast,
		borderRadius: 16,
		flexDirection: 'row',
		gap: 16,
		paddingHorizontal: 20,
		paddingVertical: 16,
		width: '100%',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	description: {
		color: theme.colors.labelColor,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'left'
	},
	iconContainer: {
		backgroundColor: `${theme.colors.primary}15`,
		borderRadius: 12,
		padding: 12,
		flexShrink: 0
	},
	textContainer: {
		flexDirection: 'column',
		flexShrink: 1,
		gap: 4
	},
	title: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'left'
	}
}))

export default WhatsNewBox
