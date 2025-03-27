import type { Dashboard } from '@/contexts/dashboard'
import type { UserKindContextType } from '@/contexts/userKind'
import { createContext } from 'react'

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
	hiddenDashboardEntries: [],
	hideDashboardEntry: () => {
		throw new Error('hideDashboardEntry not implemented')
	},
	bringBackDashboardEntry: () => {
		throw new Error('bringBackDashboardEntry not implemented')
	},
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
