import type {
	FeatureIdea,
	FeatureInterest,
	FeedbackCategory,
	FeedbackRating
} from '@/api/neuland-core-api'

export type FeedbackFollowUp = 'improvements' | 'highlights'

export const FEEDBACK_RATINGS: readonly FeedbackRating[] = [1, 2, 3, 4, 5]

export const FEATURE_INTEREST_LEVELS: readonly FeatureInterest[] = [1, 2, 3, 4]

export const FEEDBACK_FEATURE_IDEAS: readonly FeatureIdea[] = [
	'digitalId',
	'mensaPayment',
	'librarySeats',
	'roomNavigation'
]

const FOLLOW_UP_CATEGORIES: Record<
	FeedbackFollowUp,
	readonly FeedbackCategory[]
> = {
	improvements: [
		'bugs',
		'performance',
		'login',
		'usability',
		'design',
		'missingFeature'
	],
	highlights: ['timetable', 'food', 'grades', 'map', 'design', 'performance']
}

export function getFeedbackFollowUp(rating: FeedbackRating): FeedbackFollowUp {
	return rating >= 4 ? 'highlights' : 'improvements'
}

export function getFeedbackCategories(
	rating: FeedbackRating
): readonly FeedbackCategory[] {
	return FOLLOW_UP_CATEGORIES[getFeedbackFollowUp(rating)]
}

export function parseFeedbackRating(
	value: string | undefined
): FeedbackRating | undefined {
	return FEEDBACK_RATINGS.find((rating) => String(rating) === value)
}

export function createFeedbackId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Returns a shuffled copy, e.g. to avoid order bias in rating lists. */
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1))
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

export function toOptionalText(value: string): string | undefined {
	const trimmed = value.trim()
	return trimmed === '' ? undefined : trimmed
}
