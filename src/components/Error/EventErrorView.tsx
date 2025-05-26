import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'
import { createStyleSheet } from 'react-native-unistyles'

interface EventErrorViewProps {
	eventType: 'clEvents' | 'sports' | 'career' | 'counselling'
	title?: string
	message?: string
}

export function EventErrorView({
	eventType,
	title,
	message
}: EventErrorViewProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation(['common'])

	const getEventTypeIcon = (type: string) => {
		switch (type) {
			case 'clEvents':
				return {
					ios: 'calendar',
					android: 'calendar_month' satisfies MaterialIcon,
					web: 'Calendar' satisfies LucideIcon
				}
			case 'sports':
				return {
					ios: 'figure.run',
					android: 'directions_run' satisfies MaterialIcon,
					web: 'Volleyball' satisfies LucideIcon
				}
			case 'career':
				return {
					ios: 'briefcase.fill',
					android: 'work' satisfies MaterialIcon,
					web: 'Briefcase' satisfies LucideIcon
				}
			case 'counselling':
				return {
					ios: 'person.fill.questionmark',
					android: 'person_search' satisfies MaterialIcon,
					web: 'UserSearch' satisfies LucideIcon
				}
			default:
				return {
					ios: 'calendar',
					android: 'calendar_month' satisfies MaterialIcon,
					web: 'Calendar' satisfies LucideIcon
				}
		}
	}

	const getEventTypeTitle = (type: string): string => {
		switch (type) {
			case 'clEvents':
				return t('pages.clEvents.events.title')
			case 'sports':
				return t('pages.clEvents.sports.title')
			case 'career':
				return t('pages.careerService.title')
			case 'counselling':
				return t('pages.studentCounselling.title')
			default:
				return t('pages.events.title')
		}
	}

	const handleBackToList = (): void => {
		switch (eventType) {
			case 'clEvents':
				router.navigate('/cl-events?tab=events')
				break
			case 'sports':
				router.navigate('/cl-events?tab=sports')
				break
			case 'career':
				router.navigate('/thi-services?tab=career-service')
				break
			case 'counselling':
				router.navigate('/thi-services?tab=student-counselling')
				break
		}
	}

	return (
		<View style={styles.container}>
			<Animated.View style={styles.content}>
				<PlatformIcon
					ios={{
						name: getEventTypeIcon(eventType).ios,
						size: 48
					}}
					android={{
						name: getEventTypeIcon(eventType).android as MaterialIcon,
						size: 48
					}}
					web={{
						name: getEventTypeIcon(eventType).web as LucideIcon,
						size: 48
					}}
					style={{ color: theme.colors.primary }}
				/>
				<View style={styles.textContainer}>
					<View style={styles.titleContainer}>
						<View style={styles.titleTextContainer}>
							<Text style={styles.title}>
								{title ?? t('error.eventNotFound')}
							</Text>
							<Text style={styles.message}>
								{message ?? t('error.eventNotFoundDescription')}
							</Text>
						</View>
					</View>
					<Pressable style={styles.button} onPress={handleBackToList}>
						<Text style={styles.buttonText}>
							{t('error.backToEventList', {
								type: getEventTypeTitle(eventType)
							})}
						</Text>
					</Pressable>
				</View>
			</Animated.View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16
	},
	content: {
		alignItems: 'center',
		justifyContent: 'center',

		padding: 24,
		backgroundColor: theme.colors.card,
		borderRadius: 16,
		width: '100%',
		maxWidth: 400
	},
	textContainer: {
		marginTop: 24,
		width: '100%',
		alignItems: 'center',
		textAlign: 'center'
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16
	},
	titleTextContainer: {
		marginHorizontal: 4,
		gap: 6,
		flex: 1,
		alignItems: 'center'
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
		color: theme.colors.text,
		marginBottom: 4
	},
	message: {
		fontSize: 16,
		color: theme.colors.text,
		opacity: 0.8
	},
	button: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		marginTop: 16
	},
	buttonText: {
		color: theme.colors.background,
		fontSize: 16,
		fontWeight: '600'
	}
}))
