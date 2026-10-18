import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { PersonalEvent, PersonalEventDraft } from '@/types/personal-events'
import { createPersonalEventId } from '@/utils/personal-events-utils'
import { zustandStorage } from '@/utils/storage'

interface PersonalEventsStore {
	events: PersonalEvent[]
	addEvent: (draft: PersonalEventDraft) => void
	updateEvent: (id: string, patch: Partial<PersonalEventDraft>) => void
	deleteEvent: (id: string) => void
	reset: () => void
}

const initialState: { events: PersonalEvent[] } = { events: [] }

export const usePersonalEventsStore = create<PersonalEventsStore>()(
	persist(
		(set) => ({
			...initialState,
			addEvent: (draft) => {
				const now = new Date().toISOString()
				set((state) => ({
					events: [
						...state.events,
						{
							...draft,
							id: createPersonalEventId(),
							createdAt: now,
							updatedAt: now
						}
					]
				}))
			},
			updateEvent: (id, patch) =>
				set((state) => ({
					events: state.events.map((event) =>
						event.id === id
							? { ...event, ...patch, updatedAt: new Date().toISOString() }
							: event
					)
				})),
			deleteEvent: (id) =>
				set((state) => ({
					events: state.events.filter((event) => event.id !== id)
				})),
			reset: () => set(initialState)
		}),
		{
			name: 'personal-events-storage',
			version: 1,
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
