import type React from 'react'
import { FEEDBACK_CAMPAIGN_ID } from '@/data/constants'
import { useIsFeatureEnabled } from '@/hooks/useFeatureFlag'
import { useFeedbackPromptStore } from '@/hooks/useFeedbackPromptStore'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import FeedbackPrompt from './feedback-prompt'

const FeedbackPromptContainer = (): React.JSX.Element | null => {
	const enabled = useIsFeatureEnabled(FeatureFlagKeys.feedbackPrompt)
	const handledCampaignId = useFeedbackPromptStore(
		(state) => state.handledCampaignId
	)

	if (!enabled || handledCampaignId === FEEDBACK_CAMPAIGN_ID) return null

	return <FeedbackPrompt campaignId={FEEDBACK_CAMPAIGN_ID} />
}

export default FeedbackPromptContainer
