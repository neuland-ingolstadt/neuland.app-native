import { createStyleSheet } from 'react-native-unistyles'

export const roomSearchStylesheet = createStyleSheet((theme) => ({
	loadingIndicator: {
		paddingVertical: 30
	},
	optionTitle: {
		color: theme.colors.text,
		fontSize: 15
	},
	optionsRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		paddingVertical: 8
	},
	scrollView: {
		padding: 12
	},
	section: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		marginBottom: 16
	},
	sectionContainer: {
		paddingBottom: 20
	},
	sectionHeader: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		marginBottom: 4,
		textTransform: 'uppercase'
	},
	webInput: {
		appearance: 'none',
		backgroundColor: theme.colors.datePickerBackground,
		border: 'none',
		borderRadius: theme.radius.md,
		color: theme.colors.text,
		height: 32,
		outline: 'none',
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: 15
	}
}))
