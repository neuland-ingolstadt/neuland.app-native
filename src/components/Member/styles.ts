import { StyleSheet } from 'react-native'
import { createStyleSheet } from 'react-native-unistyles'

export const stylesheet = createStyleSheet((theme) => ({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	container: {
		paddingHorizontal: theme.margins.page,
		paddingTop: 20,
		paddingBottom: 30
	},
	cardWrapper: { marginBottom: 30 },
	shadow: {
		shadowColor: theme.colors.text,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 10
	},
	idCardContainer: {
		borderRadius: theme.radius.lg,
		overflow: 'visible'
	},
	idCard: {
		borderRadius: theme.radius.lg,
		padding: 24,
		minHeight: 200,
		justifyContent: 'space-between',
		backgroundColor: '#000000'
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20
	},
	logoContainer: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	titleContainer: {
		alignItems: 'flex-end'
	},
	logoText: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: 'bold'
	},
	cardTitle: {
		color: '#00ff33',
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 1.5,
		opacity: 0.9
	},
	cardContent: {
		flex: 1,
		justifyContent: 'center'
	},
	nameSection: {
		marginBottom: 20
	},
	nameLabel: {
		color: theme.colors.neulandGreen,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 1,
		opacity: 0.8,
		marginBottom: 4,
		textTransform: 'uppercase'
	},
	name: {
		color: '#ffffff',
		fontSize: 32,
		fontWeight: 'bold',
		letterSpacing: 0.5
	},
	usernameSection: {
		marginBottom: 20
	},
	emailSection: {
		marginBottom: 12
	},
	fieldLabel: {
		color: theme.colors.neulandGreen,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 1,
		opacity: 0.8,
		marginBottom: 4,
		textTransform: 'uppercase'
	},
	username: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '500',
		opacity: 0.9
	},
	email: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '500',
		opacity: 0.9
	},
	qrCodeContainer: {
		backgroundColor: '#ffffff',
		padding: 10,
		borderRadius: theme.radius.md,
		marginTop: 20,
		alignItems: 'center',
		justifyContent: 'center',
		width: 140,
		height: 140,
		alignSelf: 'center'
	},
	cardFooter: {
		marginTop: 20
	},
	footerLine: {
		height: 1,
		backgroundColor: theme.colors.neulandGreen,
		marginBottom: 12,
		opacity: 0.8
	},
	footerText: {
		color: theme.colors.neulandGreen,
		fontSize: 12,
		fontWeight: '500',
		opacity: 0.8,
		textAlign: 'center'
	},
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
		backgroundColor: 'transparent',
		paddingVertical: 12,
		borderRadius: theme.radius.md,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: theme.colors.primary
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
	}
}))
