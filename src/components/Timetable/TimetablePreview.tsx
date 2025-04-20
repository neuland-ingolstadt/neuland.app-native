import { TimetableMode } from '@/hooks/usePreferencesStore'
import { t } from 'i18next'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
	Easing
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface TimetablePreviewProps {
	mode: TimetableMode
	showCalendarEvents?: boolean
	showExams?: boolean
}

const TimetablePreview = ({
	mode,
	showCalendarEvents = false,
	showExams = false
}: TimetablePreviewProps): React.JSX.Element => {
	const { styles, theme } = useStyles(previewStylesheet)
	const [prevMode, setPrevMode] = useState<TimetableMode>(mode)
	const [visibleMode, setVisibleMode] = useState<TimetableMode>(mode)
	const animationProgress = useSharedValue(1)

	// Handle mode transitions immediately
	useEffect(() => {
		if (mode !== prevMode) {
			// Immediately update visible mode
			setVisibleMode(mode)
			// Reset animation progress to 0 and start entry animation
			animationProgress.value = 0
			animationProgress.value = withTiming(1, {
				duration: 300,
				easing: Easing.ease
			})
			setPrevMode(mode)
		}
	}, [mode])

	// Create animation styles
	const animatedContainerStyle = useAnimatedStyle(() => {
		const scale = interpolate(animationProgress.value, [0, 1], [0.95, 1])
		const opacity = interpolate(animationProgress.value, [0, 0.3, 1], [0, 0, 1])

		return {
			opacity,
			transform: [{ scale }]
		}
	})

	// Different preview layouts based on mode
	const renderPreview = () => {
		switch (visibleMode) {
			case TimetableMode.List:
				return (
					<Animated.View style={[styles.listPreview, animatedContainerStyle]}>
						{[
							{ time: '10:00', type: 'primary' },
							...(showExams ? [{ time: '12:30', type: 'exam' }] : []),
							{ time: '15:15', type: 'primary' }
						].map((event, i) => (
							<View key={i} style={styles.listItem}>
								<View style={styles.listItemTimeContainer}>
									<Text style={styles.timeText}>{event.time}</Text>
								</View>
								<View
									style={[
										styles.listItemContent,
										{
											backgroundColor:
												event.type === 'exam'
													? theme.colors.notification
													: theme.colors.primary
										}
									]}
								/>
							</View>
						))}
					</Animated.View>
				)
			case TimetableMode.Timeline1:
				return (
					<Animated.View
						style={[styles.timelinePreview, animatedContainerStyle]}
					>
						<View style={styles.dayHeader}>
							<Text style={styles.dayText}>Monday</Text>
						</View>
						<View style={styles.timelineEvents}>
							<View
								style={[
									styles.timelineEvent,
									{
										top: 80,
										height: 35,
										backgroundColor: theme.colors.primary
									}
								]}
							/>
							{showCalendarEvents && (
								<View
									style={[
										styles.timelineEvent,
										{
											top: 130,
											height: 35,
											backgroundColor: theme.colors.calendarItem
										}
									]}
								/>
							)}
							{showExams && (
								<View
									style={[
										styles.timelineEvent,
										{
											top: 30,
											height: 35,
											backgroundColor: theme.colors.notification
										}
									]}
								/>
							)}
						</View>
					</Animated.View>
				)
			case TimetableMode.Timeline3:
				return (
					<Animated.View
						style={[styles.timelinePreviewMultiDay, animatedContainerStyle]}
					>
						{['Mon', 'Tue', 'Wed'].map((day, idx) => (
							<View
								key={day}
								style={[styles.dayColumn, idx === 2 && styles.lastDayColumn]}
							>
								<Text style={styles.dayColumnHeader}>{day}</Text>
								<View style={styles.dayColumnContent}>
									{idx === 0 && (
										<View
											style={[
												styles.miniEvent,
												{ backgroundColor: theme.colors.primary }
											]}
										/>
									)}
									{idx === 1 && (
										<View
											style={[
												styles.miniEvent,
												{ backgroundColor: theme.colors.primary, top: '10%' }
											]}
										/>
									)}
									{idx === 1 && showCalendarEvents && (
										<View
											style={[
												styles.miniEvent,
												{
													top: '60%',
													backgroundColor: theme.colors.calendarItem
												}
											]}
										/>
									)}

									{idx === 2 && showExams && (
										<View
											style={[
												styles.miniEvent,
												{
													top: '30%',
													backgroundColor: theme.colors.notification
												}
											]}
										/>
									)}
								</View>
							</View>
						))}
					</Animated.View>
				)
			case TimetableMode.Timeline5:
				return (
					<Animated.View
						style={[styles.timelinePreviewMultiDay, animatedContainerStyle]}
					>
						{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
							<View
								key={day}
								style={[styles.dayColumn, idx === 4 && styles.lastDayColumn]}
							>
								<Text style={styles.dayColumnHeader}>{day}</Text>
								<View style={styles.dayColumnContent}>
									{idx === 0 && (
										<View
											style={[
												styles.miniEvent,
												{ backgroundColor: theme.colors.primary }
											]}
										/>
									)}
									{idx === 2 && showCalendarEvents && (
										<View
											style={[
												styles.miniEvent,
												{
													top: '40%',
													backgroundColor: theme.colors.calendarItem
												}
											]}
										/>
									)}
									{idx === 3 && (
										<View
											style={[
												styles.miniEvent,
												{ backgroundColor: theme.colors.primary, top: '15%' }
											]}
										/>
									)}
									{idx === 4 && showExams && (
										<View
											style={[
												styles.miniEvent,
												{
													top: '65%',
													backgroundColor: theme.colors.notification
												}
											]}
										/>
									)}
								</View>
							</View>
						))}
					</Animated.View>
				)
			case TimetableMode.Timeline7:
				return (
					<Animated.View
						style={[styles.timelinePreviewMultiDay, animatedContainerStyle]}
					>
						{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
							<View
								key={idx}
								style={[styles.dayColumn, idx === 6 && styles.lastDayColumn]}
							>
								<Text style={styles.dayColumnHeader}>{day}</Text>
								<View style={styles.dayColumnContent}>
									{idx === 1 && (
										<View
											style={[
												styles.miniEvent,
												{ backgroundColor: theme.colors.primary }
											]}
										/>
									)}
									{idx === 5 && (
										<View
											style={[
												styles.miniEvent,
												{ backgroundColor: theme.colors.primary, top: '15%' }
											]}
										/>
									)}
									{idx === 4 && showCalendarEvents && (
										<View
											style={[
												styles.miniEvent,
												{
													top: '65%',
													backgroundColor: theme.colors.calendarItem
												}
											]}
										/>
									)}
									{idx === 3 && showExams && (
										<View
											style={[
												styles.miniEvent,
												{
													top: '35%',
													backgroundColor: theme.colors.notification
												}
											]}
										/>
									)}
								</View>
							</View>
						))}
					</Animated.View>
				)
			default:
				return null
		}
	}

	return (
		<View>
			<Text style={styles.previewLabel}>
				{t('timetable:preferences.preview')}
			</Text>
			<View style={styles.previewContainer}>
				<View style={styles.previewWrapper}>
					<View style={styles.previewContent}>{renderPreview()}</View>
				</View>
			</View>
		</View>
	)
}

// Styles for the preview component
const previewStylesheet = createStyleSheet((theme) => ({
	previewLabel: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		marginBottom: 6,
		textTransform: 'uppercase'
	},
	previewContainer: {
		opacity: 1,
		paddingVertical: 16,
		paddingHorizontal: 20,
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		shadowColor: theme.colors.text,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 5,
		elevation: 1,
		maxWidth: 600,
		alignItems: 'center'
	},
	previewWrapper: {
		width: '100%'
	},
	previewContent: {
		height: 180,
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		backgroundColor: theme.colors.cardContrast
	},
	listPreview: {
		padding: 12,
		height: '100%'
	},
	listItem: {
		flexDirection: 'row',
		marginBottom: 12,
		height: 40,
		alignItems: 'center'
	},
	listItemTimeContainer: {
		width: 50,
		justifyContent: 'center'
	},
	listItemContent: {
		flex: 1,
		opacity: 0.75,
		borderRadius: theme.radius.sm,
		paddingVertical: 16,
		paddingHorizontal: 12,
		justifyContent: 'center',
		backgroundColor: theme.colors.primary
	},
	timeText: {
		fontSize: 12,
		color: theme.colors.labelColor
	},
	timeLeftText: {
		fontSize: 10,
		color: theme.colors.labelColor
	},
	contentText: {
		fontSize: 14,
		color: theme.colors.contrast,
		fontWeight: '500'
	},
	timelinePreview: {
		height: '100%',
		position: 'relative'
	},
	dayHeader: {
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomWidth: 0.5,
		borderBottomColor: theme.colors.border
	},
	dayText: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.text
	},
	timelineEvents: {
		flex: 1,
		position: 'relative'
	},
	timelineEvent: {
		position: 'absolute',
		opacity: 0.75,
		left: 12,
		right: 12,
		borderRadius: theme.radius.sm,
		padding: 8,
		justifyContent: 'center'
	},
	eventText: {
		fontSize: 12,
		color: theme.colors.contrast,
		fontWeight: '500'
	},
	timelinePreviewMultiDay: {
		flexDirection: 'row',
		height: '100%'
	},
	dayColumn: {
		flex: 1,
		borderRightWidth: 0.5,
		borderRightColor: theme.colors.border
	},
	lastDayColumn: {
		borderRightWidth: 0 // Remove right border for the last column
	},
	dayColumnHeader: {
		fontSize: 13,
		textAlign: 'center',
		paddingVertical: 8,
		fontWeight: '500',
		color: theme.colors.text,
		borderBottomWidth: 0.5,
		borderBottomColor: theme.colors.border
	},
	dayColumnContent: {
		flex: 1,
		padding: 2,
		position: 'relative'
	},
	miniEvent: {
		position: 'absolute',
		opacity: 0.75,
		top: '30%',
		left: 3,
		right: 3,
		height: 25,
		borderRadius: theme.radius.sm
	}
}))

export default TimetablePreview
