import { type Dashboard } from '@/contexts/dashboard'
import { type UserKindContextType } from '@/contexts/userKind'
import { createContext } from 'react'

export const UserKindContext = createContext<UserKindContextType>({
    userKind: 'student',
    userFaculty: undefined,
    userCampus: undefined,
    toggleUserKind: () => {},
})

export const DashboardContext = createContext<Dashboard>({
    shownDashboardEntries: [],
    hiddenDashboardEntries: [],
    hideDashboardEntry: () => {},
    bringBackDashboardEntry: () => {},
    resetOrder: () => {},
    updateDashboardOrder: () => {},
    hiddenAnnouncements: [],
    hideAnnouncement: () => {},
})
