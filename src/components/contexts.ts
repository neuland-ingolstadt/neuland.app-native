import { createContext } from 'react'
import type { Dashboard } from '@/contexts/dashboard'
import type { UserKindContextType } from '@/contexts/userKind'

export const UserKindContext = createContext<UserKindContextType>({
	userKind: 'student',
	userFaculty: undefined,
	userCampus: undefined,
	toggleUserKind: () => {
		throw new Error('toggleUserKind not implemented')
	}
})

export const DashboardContext = createContext<Dashboard>({
	shownDashboardEntries: [],
	resetOrder: () => {
		throw new Error('resetOrder not implemented')
	},
	updateDashboardOrder: () => {
		throw new Error('updateDashboardOrder not implemented')
	},
	hiddenAnnouncements: [],
	hideAnnouncement: () => {
		throw new Error('hideAnnouncement not implemented')
	}
})
