import { trackEvent } from '@aptabase/react-native'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { type FeedbackRating, submitFeedback } from '@/api/neuland-core-api'
import RatingScale from '@/components/Feedback/rating-scale'
import PlatformIcon from '@/components/Universal/icon'
import { useFeedbackPromptStore } from '@/hooks/useFeedbackPromptStore'
import { createFeedbackId } from '@/utils/feedback-utils'
import { toColor } from '@/utils/uniwind-utils'

interface FeedbackPromptProps {
	campaignId: string
}

export default function FeedbackPrompt({
	campaignId
}: FeedbackPromptProps): React.JSX.Element {
	const { t } = useTranslation('settings')
	const labelColor = toColor(useCSSVariable('--color-label'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const markHandled = useFeedbackPromptStore((state) => state.markHandled)

	const { mutate } = useMutation({
		mutationFn: submitFeedback,
		onError: (error) => {
			// The details sheet re-submits the rating under the same id.
			console.error('Error when sending feedback rating', error)
		}
	})

	const handleRate = (rating: FeedbackRating): void => {
		const id = createFeedbackId()
		trackEvent('Feedback', { action: 'rate', origin: 'home' })
		mutate({ id, campaign: campaignId, rating })
		router.navigate({
			pathname: '/feedback',
			params: { id, rating: String(rating) }
		})
		markHandled(campaignId)
	}

	const handleDismiss = (): void => {
		trackEvent('Feedback', { action: 'dismiss', origin: 'home' })
		markHandled(campaignId)
	}

	return (
		<View
			testID="feedback-prompt"
			className="bg-card border-hairline border-border rounded-lg mx-page my-1.5 w-auto overflow-hidden"
		>
			<View className="p-card gap-3">
				<View className="items-center flex-row gap-2.5">
					<View className="w-9 h-9 rounded-full justify-center items-center mr-1 bg-primary-background">
						<PlatformIcon
							ios={{ name: 'star.bubble', size: 16 }}
							android={{ name: 'rate_review', size: 22 }}
							web={{ name: 'MessageSquareHeart', size: 20 }}
							style={{ color: primaryColor }}
						/>
					</View>
					<Text className="text-text flex-1 text-[17px] font-semibold">
						{t('feedback.rating.title')}
					</Text>
					<Pressable
						testID="feedback-prompt-dismiss"
						accessibilityRole="button"
						accessibilityLabel={t('feedback.prompt.dismiss')}
						onPress={handleDismiss}
						hitSlop={10}
						className="w-8 h-8 items-center justify-center"
					>
						<PlatformIcon
							ios={{ name: 'xmark', size: 16 }}
							android={{ name: 'close', size: 24 }}
							web={{ name: 'X', size: 20 }}
							style={{ color: labelColor, opacity: 0.7 }}
						/>
					</Pressable>
				</View>
				<Text className="text-label text-[15px]">
					{t('feedback.prompt.message')}
				</Text>
				<RatingScale
					onChange={handleRate}
					testIDPrefix="feedback-prompt-rating"
				/>
			</View>
		</View>
	)
}
