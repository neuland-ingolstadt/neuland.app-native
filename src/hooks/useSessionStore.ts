import { create } from 'zustand'

interface SessionStore {
    analyticsInitialized: boolean
    initializeAnalytics: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
    analyticsInitialized: false,
    initializeAnalytics: () => {
        set((state) => {
            if (!state.analyticsInitialized) {
                return { analyticsInitialized: true }
            }
            return state
        })
    },
}))
