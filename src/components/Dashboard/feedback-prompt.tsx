import { trackEvent } from '@aptabase/react-native'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'burnt'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { type FeedbackRating, submitFeedback } from '@/api/feedback-api'
import RatingScale from '@/components/Feedback/rating-scale'
import PlatformIcon from '@/components/Universal/icon'
import { useFeedbackPromptStore } from '@/hooks/useFeedbackPromptStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
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
	const accentUnlocked = usePreferencesStore((state) => state.accentUnlocked)

	const { mutate, isPending } = useMutation({
		mutationFn: submitFeedback,
		onSuccess: () => {
			markHandled(campaignId)
		},
		onError: (error) => {
			console.error('Error when sending feedback rating', error)
			toast({
				title: t('feedback.error'),
				preset: 'error',
				haptic: 'error',
				duration: 2.5,
				from: 'top'
			})
		}
	})

	const handleRate = (rating: FeedbackRating): void => {
		if (isPending) return

		const id = createFeedbackId()
		trackEvent('Feedback', { action: 'rate', origin: 'home' })
		mutate({ id, campaign: campaignId, rating })
		router.navigate({
			pathname: '/feedback',
			params: { id, rating: String(rating) }
		})
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
				{!accentUnlocked && (
					<View className="bg-primary-background border-hairline border-primary rounded-sm px-3 py-2.5 flex-row items-center gap-2.5">
						<PlatformIcon
							ios={{ name: 'paintpalette.fill', size: 14 }}
							android={{ name: 'palette', size: 18 }}
							web={{ name: 'Palette', size: 16 }}
							style={{ color: primaryColor }}
						/>
						<Text className="text-primary text-[14px] font-medium flex-1 leading-5">
							{t('feedback.prompt.reward')}
						</Text>
					</View>
				)}
				<RatingScale
					onChange={handleRate}
					testIDPrefix="feedback-prompt-rating"
				/>
			</View>
		</View>
	)
}
