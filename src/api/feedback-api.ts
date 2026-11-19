import { Platform } from 'react-native'
import { appVersion } from '@/data/app-version'

const FEEDBACK_API_BASE_URL =
	process.env.EXPO_PUBLIC_FEEDBACK_API ?? 'https://survey.neuland.app'

/** Write key from env — still embedded in the client bundle; rate limits apply. */
const FEEDBACK_WRITE_KEY = process.env.EXPO_PUBLIC_FEEDBACK_KEY ?? ''

export type FeedbackRating = 1 | 2 | 3 | 4 | 5

export type FeedbackCategory =
	| 'bugs'
	| 'performance'
	| 'login'
	| 'usability'
	| 'design'
	| 'missingFeature'
	| 'timetable'
	| 'food'
	| 'grades'
	| 'map'

export type FeatureIdea =
	| 'digitalId'
	| 'mensaPayment'
	| 'librarySeats'
	| 'roomNavigation'
	| 'studentExchange'
	| 'campusUpdates'
	| 'eventSignup'
	| 'mensaRatings'

/** 1 = not wanted at all, 4 = absolutely wanted. Even scale, no neutral option. */
export type FeatureInterest = 1 | 2 | 3 | 4

export type FeatureInterestAnswers = Partial<
	Record<FeatureIdea, FeatureInterest>
>

export interface FeedbackSubmission {
	/**
	 * Generated on the client so the rating can be stored right away and the
	 * details added later under the same id (upsert).
	 */
	id: string
	campaign: string
	rating: FeedbackRating
	categories?: FeedbackCategory[]
	comment?: string
	featureInterest?: FeatureInterestAnswers
}

export class FeedbackApiError extends Error {
	readonly status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = 'FeedbackApiError'
		this.status = status
	}
}

/**
 * Create or update an app feedback entry on the temporary survey API.
 */
export async function submitFeedback(
	submission: FeedbackSubmission
): Promise<void> {
	const body = {
		...submission,
		platform: Platform.OS,
		appVersion
	}

	const headers: Record<string, string> = {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	}
	if (FEEDBACK_WRITE_KEY !== '') {
		headers['X-Feedback-Key'] = FEEDBACK_WRITE_KEY
	}

	const response = await fetch(`${FEEDBACK_API_BASE_URL}/v1/feedback`, {
		method: 'PUT',
		headers,
		body: JSON.stringify(body)
	})

	if (!response.ok) {
		const detail = await response.text().catch(() => '')
		throw new FeedbackApiError(
			detail !== ''
				? `Feedback API error: ${response.status} — ${detail}`
				: `Feedback API error: ${response.status}`,
			response.status
		)
	}
}
