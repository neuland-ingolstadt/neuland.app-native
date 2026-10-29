import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import type { FeedbackRating } from '@/api/neuland-core-api'
import { FEEDBACK_RATINGS } from '@/utils/feedback-utils'

const RATING_EMOJIS: Record<FeedbackRating, string> = {
	1: '😞',
	2: '🙁',
	3: '😐',
	4: '🙂',
	5: '😍'
}

interface RatingOptionProps {
	testID: string
	rating: FeedbackRating
	selected: boolean
	dimmed: boolean
	onSelect: (rating: FeedbackRating) => void
}

const RatingOption = ({
	testID,
	rating,
	selected,
	dimmed,
	onSelect
}: RatingOptionProps): React.JSX.Element => {
	const { t } = useTranslation('settings')
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }]
	}))

	return (
		<Pressable
			testID={testID}
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			accessibilityLabel={t('feedback.rating.accessibilityLabel', {
				rating,
				label: t(`feedback.rating.labels.${rating}` as const)
			})}
			onPress={() => {
				void selectionAsync()
				onSelect(rating)
			}}
			onPressIn={() => {
				scale.value = withSpring(0.92, { damping: 15 })
			}}
			onPressOut={() => {
				scale.value = withSpring(1, { damping: 15 })
			}}
			className="flex-1 items-center gap-1.5"
		>
			<Animated.View
				className={`w-full h-14 items-center justify-center rounded-lg border-2 ${
					selected
						? 'bg-primary-background border-primary'
						: 'bg-card-button border-transparent'
				} ${dimmed ? 'opacity-50' : ''}`}
				style={animatedStyle}
			>
				<Text className="text-[28px]">{RATING_EMOJIS[rating]}</Text>
			</Animated.View>
			<Text
				className={`text-[13px] ${
					selected ? 'text-primary font-semibold' : 'text-label-secondary'
				}`}
			>
				{rating}
			</Text>
		</Pressable>
	)
}

interface RatingScaleProps {
	value?: FeedbackRating
	onChange: (rating: FeedbackRating) => void
	testIDPrefix?: string
}

const RatingScale = ({
	value,
	onChange,
	testIDPrefix = 'feedback-rating'
}: RatingScaleProps): React.JSX.Element => {
	const { t } = useTranslation('settings')

	return (
		<View className="gap-1">
			<View accessibilityRole="radiogroup" className="flex-row gap-2">
				{FEEDBACK_RATINGS.map((rating) => (
					<RatingOption
						key={rating}
						testID={`${testIDPrefix}-${rating}`}
						rating={rating}
						selected={value === rating}
						dimmed={value !== undefined && value !== rating}
						onSelect={onChange}
					/>
				))}
			</View>
			<View
				className="flex-row justify-between"
				importantForAccessibility="no-hide-descendants"
				accessibilityElementsHidden
			>
				<Text className="text-label-secondary text-xs">
					{t('feedback.rating.labels.1')}
				</Text>
				<Text className="text-label-secondary text-xs">
					{t('feedback.rating.labels.5')}
				</Text>
			</View>
		</View>
	)
}

export default RatingScale
