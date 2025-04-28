import type React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const RowEntry = ({
	title,
	leftChildren,
	rightChildren,
	onPress,
	backgroundColor,
	icon
}: {
	title: string
	leftChildren: JSX.Element
	rightChildren: JSX.Element
	onPress?: () => void
	isExamCard?: boolean
	backgroundColor?: string
	icon?: JSX.Element
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	return (
		<Pressable
			disabled={!onPress}
			onPress={onPress}
			style={({ pressed }) => [styles.cardContainer, pressed && styles.pressed]}
		>
			<View style={[styles.eventContainer, { backgroundColor }]}>
				{/* Title section */}
				<View style={styles.titleContainer}>
					{icon}
					<Text
						style={styles.titleText}
						numberOfLines={2}
						textBreakStrategy="highQuality"
					>
						{title}
					</Text>
				</View>

				{/* Children section */}
				<View style={styles.childrenContainer}>
					<View style={styles.leftChildrenContainer}>{leftChildren}</View>
					<View style={styles.rightChildrenContainer}>{rightChildren}</View>
				</View>
			</View>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	cardContainer: {
		borderRadius: theme.radius.md,
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		overflow: 'hidden',
		paddingHorizontal: 12,
		paddingVertical: 16
	},
	eventContainer: {
		flexDirection: 'column',
		borderRadius: theme.radius.md,
		justifyContent: 'center'
	},
	pressed: {
		opacity: 0.9
	},
	titleContainer: {
		flexDirection: 'row',
		gap: 4,
		paddingBottom: 6
	},
	titleText: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600'
	},
	childrenContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%'
	},
	leftChildrenContainer: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'flex-start'
	},
	rightChildrenContainer: {
		flex: 1,
		alignItems: 'flex-end',
		justifyContent: 'flex-end'
	}
}))

export default RowEntry
