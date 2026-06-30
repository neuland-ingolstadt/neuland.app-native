import { t } from 'i18next'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { TimetableMode } from '@/hooks/useTimetableStore'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

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
	const primaryColor = toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	const notificationColor =
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	const calendarItemColor =
		toColor(useCSSVariable('--color-calendar-item')) ?? '#5d5d5d'
	const [prevMode, setPrevMode] = useState<TimetableMode>(mode)
	const [visibleMode, setVisibleMode] = useState<TimetableMode>(mode)
	const animationProgress = useSharedValue(1)

	useEffect(() => {
		if (mode !== prevMode) {
			setVisibleMode(mode)
			animationProgress.value = 0
			animationProgress.value = withTiming(1, {
				duration: 300,
				easing: Easing.ease
			})
			setPrevMode(mode)
		}
	}, [mode, animationProgress, prevMode])

	const animatedContainerStyle = useAnimatedStyle(() => {
		const scale = interpolate(animationProgress.value, [0, 1], [0.95, 1])
		const opacity = interpolate(animationProgress.value, [0, 0.3, 1], [0, 0, 1])

		return {
			opacity,
			transform: [{ scale }]
		}
	})

	const renderPreview = () => {
		const weekdaysShort = t('timetable:weekdays.short', {
			returnObjects: true
		}) as string[]
		const weekdaysSingle = t('timetable:weekdays.single', {
			returnObjects: true
		}) as string[]
		const mondayLong = t('timetable:weekdays.long.0')

		switch (visibleMode) {
			case TimetableMode.List:
				return (
					<Animated.View className="p-3 h-full" style={animatedContainerStyle}>
						{[
							{ time: '10:00', type: 'primary' },
							...(showExams ? [{ time: '12:30', type: 'exam' }] : []),
							{ time: '15:15', type: 'primary' }
						].map((event, i) => (
							<View key={i} className="flex-row mb-3 h-10 items-center">
								<View className="w-[50px] justify-center">
									<Text className="text-xs text-label">{event.time}</Text>
								</View>
								<View
									className="flex-1 opacity-75 rounded-xs py-4 px-3 justify-center"
									style={{
										backgroundColor:
											event.type === 'exam' ? notificationColor : primaryColor
									}}
								/>
							</View>
						))}
					</Animated.View>
				)
			case TimetableMode.Timeline1:
				return (
					<Animated.View
						className="h-full relative"
						style={animatedContainerStyle}
					>
						<View
							className="h-[30px] justify-center items-center border-b border-border"
							style={hairlineBorder}
						>
							<Text className="text-[15px] font-medium text-text">
								{mondayLong}
							</Text>
						</View>
						<View className="flex-1 relative">
							<View
								className="absolute opacity-75 left-3 right-3 rounded-xs p-2 justify-center"
								style={{ top: 80, height: 35, backgroundColor: primaryColor }}
							/>
							{showCalendarEvents && (
								<View
									className="absolute opacity-75 left-3 right-3 rounded-xs p-2 justify-center"
									style={{
										top: 130,
										height: 35,
										backgroundColor: calendarItemColor
									}}
								/>
							)}
							{showExams && (
								<View
									className="absolute opacity-75 left-3 right-3 rounded-xs p-2 justify-center"
									style={{
										top: 30,
										height: 35,
										backgroundColor: notificationColor
									}}
								/>
							)}
						</View>
					</Animated.View>
				)
			case TimetableMode.Timeline3:
				return (
					<Animated.View
						className="flex-row h-full"
						style={animatedContainerStyle}
					>
						{weekdaysShort.slice(0, 3).map((day, idx) => (
							<View
								key={`${day}-${idx}`}
								className={`flex-1 border-r border-border ${idx === 2 ? 'border-r-0' : ''}`}
								style={idx === 2 ? undefined : hairlineBorder}
							>
								<Text
									className="text-[13px] text-center py-2 font-medium text-text border-b border-border"
									style={hairlineBorder}
								>
									{day}
								</Text>
								<View className="flex-1 p-0.5 relative">
									{idx === 0 && (
										<View
											className="absolute opacity-75 top-[30%] left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{ backgroundColor: primaryColor }}
										/>
									)}
									{idx === 1 && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{ backgroundColor: primaryColor, top: '10%' }}
										/>
									)}
									{idx === 1 && showCalendarEvents && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{
												top: '60%',
												backgroundColor: calendarItemColor
											}}
										/>
									)}
									{idx === 2 && showExams && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{
												top: '30%',
												backgroundColor: notificationColor
											}}
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
						className="flex-row h-full"
						style={animatedContainerStyle}
					>
						{weekdaysShort.slice(0, 5).map((day, idx) => (
							<View
								key={`${day}-${idx}`}
								className={`flex-1 border-r border-border ${idx === 4 ? 'border-r-0' : ''}`}
							>
								<Text className="text-[13px] text-center py-2 font-medium text-text border-b border-border">
									{day}
								</Text>
								<View className="flex-1 p-0.5 relative">
									{idx === 0 && (
										<View
											className="absolute opacity-75 top-[30%] left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{ backgroundColor: primaryColor }}
										/>
									)}
									{idx === 2 && showCalendarEvents && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{
												top: '40%',
												backgroundColor: calendarItemColor
											}}
										/>
									)}
									{idx === 3 && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{ backgroundColor: primaryColor, top: '15%' }}
										/>
									)}
									{idx === 4 && showExams && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{
												top: '65%',
												backgroundColor: notificationColor
											}}
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
						className="flex-row h-full"
						style={animatedContainerStyle}
					>
						{weekdaysSingle.map((day, idx) => (
							<View
								key={`${day}-${idx}`}
								className={`flex-1 border-r border-border ${idx === 6 ? 'border-r-0' : ''}`}
							>
								<Text className="text-[13px] text-center py-2 font-medium text-text border-b border-border">
									{day}
								</Text>
								<View className="flex-1 p-0.5 relative">
									{idx === 1 && (
										<View
											className="absolute opacity-75 top-[30%] left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{ backgroundColor: primaryColor }}
										/>
									)}
									{idx === 5 && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{ backgroundColor: primaryColor, top: '15%' }}
										/>
									)}
									{idx === 4 && showCalendarEvents && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{
												top: '65%',
												backgroundColor: calendarItemColor
											}}
										/>
									)}
									{idx === 3 && showExams && (
										<View
											className="absolute opacity-75 left-[3px] right-[3px] h-[25px] rounded-xs"
											style={{
												top: '35%',
												backgroundColor: notificationColor
											}}
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
			<Text className="text-label-secondary text-[13px] font-normal mb-1.5 uppercase">
				{t('timetable:preferences.preview')}
			</Text>
			<View className="opacity-100 py-4 px-4 bg-card rounded-ios shadow-sm max-w-[600px] items-center">
				<View className="w-full">
					<View className="h-[180px] rounded-md overflow-hidden bg-card-contrast">
						{renderPreview()}
					</View>
				</View>
			</View>
		</View>
	)
}

export default TimetablePreview
