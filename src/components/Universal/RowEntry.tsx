import type React from 'react'
import { type DimensionValue, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const RowEntry = ({
	title,
	leftChildren,
	rightChildren,
	onPress,
	maxTitleWidth,
	backgroundColor,
	icon
}: {
	title: string
	leftChildren: JSX.Element
	rightChildren: JSX.Element
	onPress?: () => void
	isExamCard?: boolean
	maxTitleWidth?: DimensionValue
	backgroundColor?: string
	icon?: JSX.Element
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	return (
		<Pressable onPress={onPress}>
			<View style={{ ...styles.eventContainer, backgroundColor }}>
				<View style={[styles.detailsContainer, { maxWidth: maxTitleWidth }]}>
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
					{leftChildren}
				</View>

				{rightChildren}
			</View>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	detailsContainer: {
		alignItems: 'flex-start',

		flexDirection: 'column',
		maxWidth: '70%',
		padding: theme.margins.rowPadding
	},
	eventContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
		paddingVertical: 12
	},
	titleContainer: { flexDirection: 'row', gap: 4, paddingBottom: 2 },
	titleText: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 1
	}
}))

export default RowEntry
