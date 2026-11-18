import type React from 'react'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'

interface SurveyProgressProps {
	step: number
	total: number
	label: string
}

const SurveyProgress = ({
	step,
	total,
	label
}: SurveyProgressProps): React.JSX.Element => {
	const progress = total > 0 ? Math.min(Math.max(step / total, 0), 1) : 0
	const width = useSharedValue(progress)

	useEffect(() => {
		width.set(
			withSpring(progress, {
				damping: 22,
				stiffness: 180,
				mass: 0.8
			})
		)
	}, [progress, width])

	const fillStyle = useAnimatedStyle(() => ({
		width: `${width.get() * 100}%`
	}))

	return (
		<View
			accessibilityRole="progressbar"
			accessibilityValue={{
				min: 0,
				max: total,
				now: step,
				text: label
			}}
			className="gap-2 px-page"
		>
			<Text className="text-label-secondary text-[13px] font-medium">
				{label}
			</Text>
			<View className="h-1.5 bg-card-button rounded-infinite overflow-hidden">
				<Animated.View
					className="h-full rounded-infinite bg-primary"
					style={fillStyle}
				/>
			</View>
		</View>
	)
}

export default SurveyProgress
