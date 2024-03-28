import { type AppIconHook } from '@/hooks/contexts/appIcon'
import { type Dashboard } from '@/hooks/contexts/dashboard'
import { type FlowHook } from '@/hooks/contexts/flow'
import { type FoodFilter } from '@/hooks/contexts/foodFilter'
import { type IdCard } from '@/hooks/contexts/idCard'
import { type Notifications } from '@/hooks/contexts/notifications'
import { type RouteParams } from '@/hooks/contexts/routing'
import {
    DEFAULT_TIMETABLE_MODE,
    type TimetableHook,
} from '@/hooks/contexts/timetable'
import { createContext } from 'react'

export const RouteParamsContext = createContext<RouteParams>({
    routeParams: '',
    updateRouteParams: () => {},
    lecture: null,
    updateLecture: () => {},
})

export const FoodFilterContext = createContext<FoodFilter>({
    allergenSelection: [],
    preferencesSelection: [],
    selectedRestaurants: [],
    showStatic: false,
    foodLanguage: 'default',
    toggleSelectedAllergens: () => {},
    initAllergenSelection: () => {},
    toggleSelectedPreferences: () => {},
    toggleSelectedRestaurant: () => {},
    toggleShowStatic: () => {},
    toggleFoodLanguage: () => {},
})

export const UserKindContext = createContext<any>({
    userKind: 'student',
    userFaculty: 'unknown',
    userFullName: '',
    toggleUserKind: () => {},
    updateUserFullName: () => {},
})

export const ThemeContext = createContext<any>({
    accentColor: 'blue',
    toggleAccentColor: () => {},
})

export const AppIconContext = createContext<AppIconHook>({
    appIcon: 'default',
    unlockedAppIcons: [],
    toggleAppIcon: () => {},
    addUnlockedAppIcon: () => {},
})

export const DashboardContext = createContext<Dashboard>({
    shownDashboardEntries: [],
    hiddenDashboardEntries: [],
    hideDashboardEntry: () => {},
    bringBackDashboardEntry: () => {},
    resetOrder: () => {},
    updateDashboardOrder: () => {},
})

export const FlowContext = createContext<FlowHook>({
    isOnboarded: true,
    toggleOnboarded: () => {},
    isUpdated: true,
    toggleUpdated: () => {},
    analyticsAllowed: false,
    toggleAnalytics: () => {},
    analyticsInitialized: false,
    initializeAnalytics: () => {},
})

export const TimetableContext = createContext<TimetableHook>({
    timetableMode: DEFAULT_TIMETABLE_MODE,
    setTimetableMode: () => {},
    selectedDate: new Date(),
    setSelectedDate: () => {},
})

export const NotificationContext = createContext<Notifications>({
    timetableNotifications: {},
    updateTimetableNotifications: () => {},
    deleteTimetableNotifications: () => {},
    removeNotification: () => {},
})

export const IdCardContext = createContext<IdCard>({
    mensaBalance: 0,
    idLastUpdated: null,
    updateMensaBalance: () => {},
})
