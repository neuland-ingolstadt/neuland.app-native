import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const ToggleRow = ({
	items,
	selectedElement,
	setSelectedElement
}: {
	items: string[]
	selectedElement: number
	setSelectedElement: (element: number) => void
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	const pressHandler = (index: number) => {
		setSelectedElement(index)
		if (Platform.OS === 'ios') {
			void selectionAsync()
		}
	}

	return (
		<View style={styles.buttonRow}>
			{items.map((item, index) => {
				return (
					<View key={index} style={styles.buttonView}>
						<Pressable
							onPress={() => {
								pressHandler(index)
							}}
						>
							<View style={styles.buttonContainer}>
								<Text style={styles.text(selectedElement === index)}>
									{item}
								</Text>
							</View>
						</Pressable>
					</View>
				)
			})}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	buttonContainer: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		paddingHorizontal: theme.margins.page,
		paddingVertical: 10,
		shadowColor: theme.colors.text,

		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.1,
		shadowRadius: 1,
		width: '100%'
	},
	buttonRow: {
		alignSelf: 'center',
		flexDirection: 'row',
		gap: 12,
		justifyContent: 'space-between',
		width: '100%'
	},
	buttonView: {
		flex: 1
	},
	text(selected: boolean) {
		return {
			fontWeight: selected ? '500' : 'normal',
			color: selected ? theme.colors.primary : theme.colors.text,
			fontSize: 15
		}
	}
}))

export default ToggleRow
