import { trackEvent } from '@aptabase/react-native'
import { useMutation } from '@tanstack/react-query'
import { selectionAsync } from 'expo-haptics'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import {
	type FeatureIdea,
	type FeatureInterest,
	type FeatureInterestAnswers,
	type FeedbackCategory,
	type FeedbackRating,
	submitFeedback
} from '@/api/feedback-api'
import AccentChoiceStep, {
	type AccentChoice
} from '@/components/Feedback/accent-choice-step'
import CategoryChips from '@/components/Feedback/category-chips'
import FeatureInterestStep from '@/components/Feedback/feature-interest-step'
import RatingScale from '@/components/Feedback/rating-scale'
import SurveyProgress from '@/components/Feedback/survey-progress'
import Button from '@/components/Universal/button'
import PlatformIcon from '@/components/Universal/icon'
import { FEEDBACK_CAMPAIGN_ID } from '@/data/constants'
import { useFeedbackPromptStore } from '@/hooks/useFeedbackPromptStore'
import {
	type ThemeColor,
	usePreferencesStore
} from '@/hooks/usePreferencesStore'
import {
	createFeedbackId,
	FEEDBACK_FEATURE_IDEAS,
	FEEDBACK_REWARD_ACCENT,
	getFeedbackCategories,
	getFeedbackFollowUp,
	parseFeedbackRating,
	shuffled,
	toOptionalText
} from '@/utils/feedback-utils'
import { toColor } from '@/utils/uniwind-utils'

const TEXT_MAX_LENGTH = 2000
const AUTO_ADVANCE_MS = 280

type SurveyStep =
	| { kind: 'rating' }
	| { kind: 'categories' }
	| { kind: 'feature'; idea: FeatureIdea }
	| { kind: 'comment' }
	| { kind: 'accent' }

function buildSteps(featureIdeas: readonly FeatureIdea[]): SurveyStep[] {
	return [
		{ kind: 'rating' },
		{ kind: 'categories' },
		...featureIdeas.map(
			(idea): SurveyStep => ({
				kind: 'feature',
				idea
			})
		),
		{ kind: 'comment' }
	]
}

export default function Feedback(): React.JSX.Element {
	const { t } = useTranslation('settings')
	const navigation = useNavigation()
	const markHandled = useFeedbackPromptStore((state) => state.markHandled)
	const accentUnlocked = usePreferencesStore((state) => state.accentUnlocked)
	const unlockAccent = usePreferencesStore((state) => state.unlockAccent)
	const themeColor = usePreferencesStore((state) => state.themeColor)
	const setThemeColor = usePreferencesStore((state) => state.setThemeColor)
	const params = useLocalSearchParams<{ id?: string; rating?: string }>()
	const savedRating = parseFeedbackRating(params.rating)
	const origin = savedRating !== undefined ? 'home' : 'direct'
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	const [submissionId] = useState(() => params.id ?? createFeedbackId())
	const [featureIdeas] = useState(() => shuffled(FEEDBACK_FEATURE_IDEAS))
	const [steps, setSteps] = useState(() => buildSteps(featureIdeas))
	const [stepIndex, setStepIndex] = useState(() =>
		savedRating !== undefined ? 1 : 0
	)
	const [rating, setRating] = useState<FeedbackRating | undefined>(savedRating)
	const [categories, setCategories] = useState<FeedbackCategory[]>([])
	const [comment, setComment] = useState('')
	const [featureInterest, setFeatureInterest] =
		useState<FeatureInterestAnswers>({})
	const [previousAccent, setPreviousAccent] = useState<ThemeColor>(themeColor)
	const [accentChoice, setAccentChoice] = useState<AccentChoice>('keep')

	const step = steps[stepIndex]
	const isAccentStep = step?.kind === 'accent'
	const isFirstStep = stepIndex === 0
	const isLastSurveyStep =
		step?.kind === 'comment' ||
		(stepIndex === steps.length - 1 && !isAccentStep)

	useEffect(() => {
		navigation.setOptions({
			gestureEnabled: !isAccentStep,
			headerBackVisible: !isAccentStep
		})
	}, [isAccentStep, navigation])

	const { mutate, isPending } = useMutation({
		mutationFn: submitFeedback,
		onSuccess: () => {
			trackEvent('Feedback', { action: 'submit', origin })
			markHandled(FEEDBACK_CAMPAIGN_ID)

			if (!accentUnlocked) {
				setPreviousAccent(themeColor)
				setAccentChoice('keep')
				setSteps((current) =>
					current.some((item) => item.kind === 'accent')
						? current
						: [...current, { kind: 'accent' }]
				)
				setStepIndex((current) => current + 1)
				if (Platform.OS === 'ios') {
					void selectionAsync()
				}
				return
			}

			router.back()
		},
		onError: (error) => {
			trackEvent('Feedback', { action: 'submitError', origin })
			console.error('Error when sending feedback', error)
		}
	})

	const goNext = (): void => {
		setStepIndex((current) => Math.min(current + 1, steps.length - 1))
	}

	const goBack = (): void => {
		if (isAccentStep) return
		if (isFirstStep) {
			router.back()
			return
		}
		setStepIndex((current) => Math.max(current - 1, 0))
	}

	const finishWithAccent = (): void => {
		const nextColor =
			accentChoice === 'reward' ? FEEDBACK_REWARD_ACCENT : previousAccent
		unlockAccent()
		setThemeColor(nextColor)
		trackEvent('Feedback', { action: 'accentUnlock', origin })
		trackEvent('Feedback', {
			action: 'accentPick',
			choice: accentChoice,
			color: nextColor
		})
		router.back()
	}

	const handleSubmit = (): void => {
		if (rating === undefined) return
		mutate({
			id: submissionId,
			campaign: FEEDBACK_CAMPAIGN_ID,
			rating,
			categories: categories.length > 0 ? categories : undefined,
			comment: toOptionalText(comment),
			featureInterest:
				Object.keys(featureInterest).length > 0 ? featureInterest : undefined
		})
	}

	const handleRatingChange = (next: FeedbackRating): void => {
		if (
			rating !== undefined &&
			getFeedbackFollowUp(next) !== getFeedbackFollowUp(rating)
		) {
			setCategories([])
		}
		setRating(next)
		setTimeout(() => {
			setStepIndex((current) => Math.min(current + 1, steps.length - 1))
		}, AUTO_ADVANCE_MS)
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
		setTimeout(() => {
			setStepIndex((current) => Math.min(current + 1, steps.length - 1))
		}, AUTO_ADVANCE_MS)
	}

	const primaryLabel = isAccentStep
		? t('feedback.accentUnlock.continue')
		: isLastSurveyStep
			? t('feedback.submit')
			: t('feedback.next')
	const showUnlockHint = isLastSurveyStep && !accentUnlocked && !isAccentStep

	const handlePrimary = (): void => {
		if (Platform.OS === 'ios') void selectionAsync()
		if (isAccentStep) {
			finishWithAccent()
			return
		}
		if (isLastSurveyStep) {
			handleSubmit()
			return
		}
		if (step.kind === 'rating' && rating === undefined) return
		goNext()
	}

	const primaryDisabled =
		(!isAccentStep && step.kind === 'rating' && rating === undefined) ||
		isPending

	return (
		<View testID="feedback-screen" className="flex-1 bg-background">
			<View className="pt-3 pb-2">
				<SurveyProgress step={stepIndex + 1} total={steps.length} />
			</View>

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-page pt-4 pb-6 grow"
				contentInsetAdjustmentBehavior="automatic"
				automaticallyAdjustKeyboardInsets
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
			>
				<View
					key={`${step.kind}-${step.kind === 'feature' ? step.idea : stepIndex}`}
					className="flex-1"
				>
					{step.kind === 'rating' && (
						<View className="gap-5">
							<View className="gap-2">
								<Text className="text-text text-[26px] font-bold leading-8">
									{t('feedback.rating.title')}
								</Text>
								<Text className="text-label text-[15px] leading-5">
									{savedRating === undefined
										? t('feedback.intro')
										: t('feedback.ratingSaved')}
								</Text>
							</View>
							{!accentUnlocked && (
								<View className="bg-primary-background border-hairline border-primary ios:rounded-ios android:rounded-md web:rounded-md px-card py-3.5 flex-row items-center gap-2.5">
									<PlatformIcon
										ios={{ name: 'paintpalette.fill', size: 16 }}
										android={{ name: 'palette', size: 20 }}
										web={{ name: 'Palette', size: 18 }}
										style={{ color: primaryColor }}
									/>
									<Text className="text-primary text-[15px] font-medium flex-1 leading-5">
										{t('feedback.prompt.reward')}
									</Text>
								</View>
							)}
							<View className="bg-card border-hairline border-border ios:rounded-ios android:rounded-md web:rounded-md p-card">
								<RatingScale value={rating} onChange={handleRatingChange} />
							</View>
						</View>
					)}

					{step.kind === 'categories' && rating !== undefined && (
						<View className="gap-5">
							<View className="gap-2">
								<Text className="text-text text-[26px] font-bold leading-8">
									{t(
										`feedback.followUp.${getFeedbackFollowUp(rating)}` as const
									)}
								</Text>
								<Text className="text-label text-[15px] leading-5">
									{t('feedback.categoriesHint')}
								</Text>
							</View>
							<View className="bg-card border-hairline border-border ios:rounded-ios android:rounded-md web:rounded-md p-card">
								<CategoryChips
									categories={getFeedbackCategories(rating)}
									selected={categories}
									onToggle={toggleCategory}
								/>
							</View>
						</View>
					)}

					{step.kind === 'feature' && (
						<View className="bg-card border-hairline border-border ios:rounded-ios android:rounded-md web:rounded-md p-card">
							<FeatureInterestStep
								idea={step.idea}
								value={featureInterest[step.idea]}
								onChange={handleFeatureInterest}
							/>
						</View>
					)}

					{step.kind === 'comment' && (
						<View className="gap-5">
							<View className="gap-2">
								<Text className="text-text text-[26px] font-bold leading-8">
									{t('feedback.comment.title')}
								</Text>
							</View>
							<View className="bg-card border-hairline border-border ios:rounded-ios android:rounded-md web:rounded-md p-card gap-3">
								<TextInput
									testID="feedback-comment"
									multiline
									maxLength={TEXT_MAX_LENGTH}
									className="text-text text-base min-h-[120px] bg-card-button rounded-sm px-3 pt-2.5 pb-2.5"
									style={{ textAlignVertical: 'top' }}
									placeholder={t('feedback.comment.placeholder')}
									placeholderTextColor={labelTertiaryColor}
									value={comment}
									onChangeText={setComment}
								/>
								<Text className="text-label-secondary text-xs leading-4">
									{t('feedback.comment.footer')}
								</Text>
							</View>
						</View>
					)}

					{step.kind === 'accent' && (
						<AccentChoiceStep
							previousColor={previousAccent}
							choice={accentChoice}
							onChoiceChange={setAccentChoice}
						/>
					)}
				</View>
			</ScrollView>

			<View className="px-page pt-3 pb-bottom-safe gap-2.5 border-t-hairline border-border bg-background">
				{showUnlockHint && (
					<View className="flex-row items-center justify-center gap-1.5 px-2">
						<PlatformIcon
							ios={{ name: 'paintpalette.fill', size: 12 }}
							android={{ name: 'palette', size: 14 }}
							web={{ name: 'Palette', size: 13 }}
							style={{ color: primaryColor }}
						/>
						<Text className="text-primary text-[13px] font-medium">
							{t('feedback.submitUnlockHint')}
						</Text>
					</View>
				)}
				<View className="flex-row gap-2 items-center">
					{!isAccentStep && (
						<Pressable
							testID="feedback-back"
							accessibilityRole="button"
							accessibilityLabel={t('feedback.back')}
							onPress={() => {
								if (Platform.OS === 'ios') void selectionAsync()
								goBack()
							}}
							className="h-12 px-5 items-center justify-center rounded-base bg-card-button active:opacity-70"
						>
							<Text className="text-label-secondary text-[16px] font-medium">
								{t('feedback.back')}
							</Text>
						</Pressable>
					)}
					<View className="flex-1">
						<Button
							testID={
								isAccentStep
									? 'feedback-accent-continue'
									: isLastSurveyStep
										? 'feedback-submit'
										: 'feedback-next'
							}
							disabled={primaryDisabled}
							loading={isPending}
							onPress={handlePrimary}
						>
							{primaryLabel}
						</Button>
					</View>
				</View>
			</View>
		</View>
	)
}
