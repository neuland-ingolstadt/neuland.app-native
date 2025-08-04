import { Link, type RelativePathString } from 'expo-router'
import type React from 'react'
import type { JSX } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const RowEntry = ({
	title,
	leftChildren,
	rightChildren,
	onPress,
	href,
	backgroundColor,
	icon
}: {
	title: string
	leftChildren: JSX.Element
	rightChildren: JSX.Element
	onPress?: () => void
	href?: RelativePathString
	isExamCard?: boolean
	backgroundColor?: string
	icon?: JSX.Element
}): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)
	const content = (
		<View
			style={[
				styles.cardContainer,
				{ backgroundColor: backgroundColor ?? theme.colors.card }
			]}
		>
			<View style={styles.eventContainer}>
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
		</View>
	)

	if (!href) {
		return onPress ? (
			<Pressable
				onPress={onPress}
				style={({ pressed }) => pressed && styles.pressed}
			>
				{content}
			</Pressable>
		) : (
			content
		)
	}

	return (
		<Link href={href} asChild>
			<Pressable
				onPress={onPress}
				style={({ pressed }) => pressed && styles.pressed}
			>
				{content}
			</Pressable>
		</Link>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	cardContainer: {
		borderRadius: theme.radius.md,
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		overflow: 'hidden',
		paddingHorizontal: 14,
		paddingVertical: 16,
		width: '100%'
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
		flex: 2,
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
