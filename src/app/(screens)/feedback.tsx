import { useMutation } from '@tanstack/react-query'
import { toast } from 'burnt'
import { router, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import {
	type FeatureIdea,
	type FeatureInterest,
	type FeatureInterestAnswers,
	type FeedbackCategory,
	type FeedbackRating,
	submitFeedback
} from '@/api/neuland-core-api'
import CategoryChips from '@/components/Feedback/category-chips'
import FeatureInterestList from '@/components/Feedback/feature-interest-list'
import RatingScale from '@/components/Feedback/rating-scale'
import Button from '@/components/Universal/button'
import SectionView from '@/components/Universal/sections-view'
import { FEEDBACK_CAMPAIGN_ID } from '@/data/constants'
import { useFeedbackPromptStore } from '@/hooks/useFeedbackPromptStore'
import {
	createFeedbackId,
	FEEDBACK_FEATURE_IDEAS,
	getFeedbackCategories,
	getFeedbackFollowUp,
	parseFeedbackRating,
	shuffled,
	toOptionalText
} from '@/utils/feedback-utils'
import { toColor } from '@/utils/uniwind-utils'

const TEXT_MAX_LENGTH = 2000

interface QuestionTitleProps {
	title: string
	optional?: boolean
}

function QuestionTitle({
	title,
	optional = false
}: QuestionTitleProps): React.JSX.Element {
	const { t } = useTranslation('settings')

	return (
		<View className="flex-row items-baseline justify-between gap-2">
			<Text className="text-text text-[17px] font-semibold shrink">
				{title}
			</Text>
			{optional && (
				<Text className="text-label-secondary text-[13px]">
					{t('feedback.optional')}
				</Text>
			)}
		</View>
	)
}

interface FeedbackTextInputProps {
	testID: string
	placeholder: string
	value: string
	onChangeText: (text: string) => void
}

function FeedbackTextInput({
	testID,
	placeholder,
	value,
	onChangeText
}: FeedbackTextInputProps): React.JSX.Element {
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))

	return (
		<TextInput
			testID={testID}
			multiline
			maxLength={TEXT_MAX_LENGTH}
			className="text-text text-base min-h-[120px] bg-card-button rounded-sm px-3 pt-2.5 pb-2.5"
			style={{ textAlignVertical: 'top' }}
			placeholder={placeholder}
			placeholderTextColor={labelTertiaryColor}
			value={value}
			onChangeText={onChangeText}
		/>
	)
}

export default function Feedback(): React.JSX.Element {
	const { t } = useTranslation('settings')
	const markHandled = useFeedbackPromptStore((state) => state.markHandled)
	const params = useLocalSearchParams<{ id?: string; rating?: string }>()
	// A rating passed in from the home prompt has already been submitted.
	const savedRating = parseFeedbackRating(params.rating)
	const [submissionId] = useState(() => params.id ?? createFeedbackId())
	const [featureIdeas] = useState(() => shuffled(FEEDBACK_FEATURE_IDEAS))
	const [rating, setRating] = useState<FeedbackRating | undefined>(savedRating)
	const [categories, setCategories] = useState<FeedbackCategory[]>([])
	const [comment, setComment] = useState('')
	const [featureInterest, setFeatureInterest] =
		useState<FeatureInterestAnswers>({})
	const [missingFeatures, setMissingFeatures] = useState('')

	const { mutate, isPending } = useMutation({
		mutationFn: submitFeedback,
		onSuccess: () => {
			markHandled(FEEDBACK_CAMPAIGN_ID)
			toast({
				title: t('feedback.success'),
				preset: 'done',
				haptic: 'success',
				duration: 2.5,
				from: 'top'
			})
			router.back()
		},
		onError: (error) => {
			toast({
				title: t('feedback.error'),
				preset: 'error',
				haptic: 'error',
				duration: 2.5,
				from: 'top'
			})
			console.error('Error when sending feedback', error)
		}
	})

	const handleRatingChange = (next: FeedbackRating): void => {
		if (
			rating !== undefined &&
			getFeedbackFollowUp(next) !== getFeedbackFollowUp(rating)
		) {
			setCategories([])
		}
		setRating(next)
	}

	const toggleCategory = (category: FeedbackCategory): void => {
		setCategories((current) =>
			current.includes(category)
				? current.filter((item) => item !== category)
				: [...current, category]
		)
	}

	const handleFeatureInterest = (
		idea: FeatureIdea,
		level: FeatureInterest
	): void => {
		setFeatureInterest((current) => ({ ...current, [idea]: level }))
	}

	const handleSubmit = (): void => {
		if (rating === undefined) return
		mutate({
			id: submissionId,
			campaign: FEEDBACK_CAMPAIGN_ID,
			rating,
			categories,
			comment: toOptionalText(comment),
			featureInterest:
				Object.keys(featureInterest).length > 0 ? featureInterest : undefined,
			missingFeatures: toOptionalText(missingFeatures)
		})
	}

	return (
		<ScrollView
			testID="feedback-screen"
			className="flex-1 bg-background"
			contentContainerClassName="pt-2 pb-bottom-safe"
			contentInsetAdjustmentBehavior="automatic"
			automaticallyAdjustKeyboardInsets
			keyboardShouldPersistTaps="handled"
			keyboardDismissMode="interactive"
		>
			<Text className="text-label text-[15px] px-page ios:mx-4 mt-2">
				{savedRating === undefined
					? t('feedback.intro')
					: t('feedback.ratingSaved')}
			</Text>

			<SectionView>
				<View className="p-card gap-4">
					<QuestionTitle title={t('feedback.rating.title')} />
					<RatingScale value={rating} onChange={handleRatingChange} />
				</View>
			</SectionView>

			{rating !== undefined && (
				<Animated.View entering={FadeInDown.duration(250)}>
					<SectionView>
						<View className="p-card gap-3">
							<QuestionTitle
								title={t(
									`feedback.followUp.${getFeedbackFollowUp(rating)}` as const
								)}
								optional
							/>
							<CategoryChips
								categories={getFeedbackCategories(rating)}
								selected={categories}
								onToggle={toggleCategory}
							/>
						</View>
					</SectionView>

					<SectionView>
						<View className="p-card gap-2">
							<QuestionTitle title={t('feedback.comment.title')} optional />
							<FeedbackTextInput
								testID="feedback-comment"
								placeholder={t('feedback.comment.placeholder')}
								value={comment}
								onChangeText={setComment}
							/>
						</View>
					</SectionView>

					<SectionView>
						<View className="px-card pt-card pb-1 gap-1">
							<QuestionTitle title={t('feedback.features.title')} optional />
							<FeatureInterestList
								ideas={featureIdeas}
								value={featureInterest}
								onChange={handleFeatureInterest}
							/>
						</View>
					</SectionView>

					<SectionView footer={t('feedback.comment.footer')}>
						<View className="p-card gap-2">
							<QuestionTitle title={t('feedback.missing.title')} optional />
							<FeedbackTextInput
								testID="feedback-missing"
								placeholder={t('feedback.missing.placeholder')}
								value={missingFeatures}
								onChangeText={setMissingFeatures}
							/>
						</View>
					</SectionView>
				</Animated.View>
			)}

			<View className="px-page mt-section">
				<Button
					testID="feedback-submit"
					disabled={rating === undefined}
					loading={isPending}
					onPress={handleSubmit}
				>
					{t('feedback.submit')}
				</Button>
				{rating === undefined && (
					<Text className="text-label-secondary text-xs text-center mt-2">
						{t('feedback.submitHint')}
					</Text>
				)}
			</View>
		</ScrollView>
	)
}
