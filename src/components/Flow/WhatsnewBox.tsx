import type { MaterialIcon } from '@/types/material-icons'
import type { FC } from 'react'
import { Text, View } from 'react-native'
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
		borderRadius: theme.radius.mg,
		flexDirection: 'row',
		gap: 18,
		paddingHorizontal: 20,
		paddingVertical: 15,
		width: '100%'
	},
	description: {
		color: theme.colors.labelColor,
		fontSize: 14.5,
		textAlign: 'left'
	},
	iconContainer: {
		flexShrink: 0
	},
	textContainer: {
		flexDirection: 'column',
		flexShrink: 1,
		paddingRight: 40
	},
	title: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'left'
	}
}))

export default WhatsNewBox
