import { Platform } from 'react-native'
import { createStyleSheet } from 'react-native-unistyles'

export const dashboardStyles = createStyleSheet((theme) => ({
	block: {
		alignSelf: 'center',
		gap: 6,
		width: '100%'
	},
	blockContainer: {
		backgroundColor: theme.colors.card,
		marginTop: 6
	},
	card: {
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		paddingHorizontal: 0
	},
	emptyContainer: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		justifyContent: 'center'
	},
	footer: {
		color: theme.colors.labelColor,
		fontSize: 12,
		fontWeight: 'normal',
		textAlign: 'left'
	},
	minusIcon: {
		color: theme.colors.labelSecondaryColor
	},
	outer: {
		borderRadius: theme.radius.md,
		flex: 1,
		overflow: 'hidden'
	},
	outerRow: {
		borderColor: theme.colors.border
	},
	page: {
		paddingHorizontal: theme.margins.page,
		paddingBottom: theme.margins.page
	},
	reset: (hasUserDefaultOrder: boolean) => ({
		fontSize: 16,
		marginVertical: 13,
		alignSelf: 'center',
		color: hasUserDefaultOrder ? theme.colors.labelColor : theme.colors.text
	}),
	restoreIcon: {
		color: theme.colors.text
	},
	row: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		flexDirection: 'row',
		gap: 14,
		justifyContent: 'center',
		minHeight: 50,
		paddingHorizontal: 16
	},
	blockHeader: {
		...(Platform.OS === 'ios'
			? {
					color: theme.colors.labelSecondaryColor,
					fontSize: 16,
					marginLeft: 18,
					fontWeight: '600',
					paddingBottom: 4
				}
			: {
					color: theme.colors.labelSecondaryColor,
					fontSize: 13,
					fontWeight: 'normal',
					textTransform: 'uppercase'
				})
	},
	shownBg: {
		backgroundColor: theme.colors.background
	},
	text: {
		color: theme.colors.text,
		flexGrow: 1,
		flexShrink: 1,
		fontSize: 16
	},
	textEmpty: {
		color: theme.colors.text,
		fontSize: 16,
		textAlign: 'center'
	},
	wrapper: {
		gap: 14
	}
}))
