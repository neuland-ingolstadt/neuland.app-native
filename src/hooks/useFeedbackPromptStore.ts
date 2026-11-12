import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

interface FeedbackPromptStore {
	handledCampaignId: string | null
	markHandled: (campaignId: string) => void
	reset: () => void
}

const initialState = {
	handledCampaignId: null
}

export const useFeedbackPromptStore = create<FeedbackPromptStore>()(
	persist(
		(set) => ({
			...initialState,
			markHandled: (campaignId: string) =>
				set({ handledCampaignId: campaignId }),
			reset: () => set(initialState)
		}),
		{
			name: 'feedback-prompt-store',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
