import { StyleSheet } from 'react-native'
import { createStyleSheet } from 'react-native-unistyles'

export const stylesheet = createStyleSheet((theme) => ({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	container: {
		paddingHorizontal: theme.margins.page,
		paddingTop: 20,
		paddingBottom: 30
	},
	cardWrapper: { marginBottom: 50 },
	groupList: {
		padding: 24
	},
	groupTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: theme.colors.text,
		marginBottom: 16,
		textAlign: 'center'
	},
	groupContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		justifyContent: 'center'
	},
	groupBadge: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.infinite,
		paddingHorizontal: 16,
		paddingVertical: 8
	},
	groupBadgePressed: {
		backgroundColor: theme.colors.labelBackground,
		opacity: 0.8
	},
	groupText: {
		color: theme.colors.text,
		fontSize: 12,
		fontWeight: '600'
	},
	header: {
		fontSize: 22,
		fontWeight: 'bold',
		marginVertical: 20,
		color: theme.colors.text
	},
	row: { marginBottom: 10 },
	key: { fontWeight: 'bold', color: theme.colors.text },
	value: { color: theme.colors.text },
	link: { color: theme.colors.primary, fontSize: 16 },
	logoutButton: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
		marginVertical: 30,
		minWidth: 165,
		paddingHorizontal: 40,
		paddingVertical: 12
	},
	logoutText: {
		color: theme.colors.notification,
		fontSize: 16
	},
	notification: {
		color: theme.colors.notification
	},

	// Logged Out Styles
	loggedOutPage: {
		backgroundColor: theme.colors.background
	},
	loggedOutContainer: {
		padding: theme.margins.page
	},
	welcomeCard: {
		borderRadius: theme.radius.lg,
		overflow: 'hidden',
		marginBottom: 24
	},
	welcomeGradient: {
		padding: 16,
		alignItems: 'center',
		backgroundColor: theme.colors.card
	},
	welcomeTitle: {
		color: theme.colors.text,
		fontSize: 22,
		fontWeight: 'bold',
		marginTop: 12
	},
	welcomeSubtitle: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		marginTop: 4,
		textAlign: 'center'
	},
	sectionTitle: {
		color: theme.colors.text,
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16
	},
	benefitCard: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.lg,
		padding: 12,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12
	},
	benefitIconContainer: {
		backgroundColor: theme.colors.primary,
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12
	},
	benefitIcon: {
		color: theme.colors.contrast
	},
	benefitTextContainer: {
		flex: 1
	},
	benefitTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: 'bold'
	},
	benefitDescription: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		marginTop: 2
	},
	buttonContainer: {
		marginTop: 32,
		gap: 12
	},
	primaryButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: 12,
		borderRadius: theme.radius.md,
		alignItems: 'center'
	},
	primaryButtonText: {
		color: theme.colors.background,
		fontSize: 16,
		fontWeight: 'bold'
	},
	secondaryButton: {
		backgroundColor: theme.colors.card,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.md,
		alignItems: 'center'
	},
	secondaryButtonText: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: 'bold'
	},
	buttonPressed: {
		opacity: 0.8
	},
	debugInfo: {
		marginTop: 20,
		padding: 10,
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		alignItems: 'center'
	},
	debugText: {
		color: theme.colors.text,
		fontSize: 14
	},

	officeSection: {
		marginBottom: 24
	},
	officeHeader: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: '600',
		marginBottom: 8,
		marginLeft: 4,
		textTransform: 'uppercase'
	},
	officeCard: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.lg,
		gap: 16,
		padding: 16
	},
	officeCountRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 12
	},
	officeCountText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 16,
		fontWeight: '600'
	},
	disclaimer: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12
	},
	pulsingDot: {
		width: 8,
		height: 8,
		borderRadius: 4
	},
	smallPulsingDot: {
		backgroundColor: theme.colors.success,
		borderRadius: 3,
		height: 6,
		width: 6
	}
}))
