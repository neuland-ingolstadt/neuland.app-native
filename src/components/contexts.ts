import { type AppIconHook } from '@/contexts/appIcon'
import { type Dashboard } from '@/contexts/dashboard'
import { type FlowHook } from '@/contexts/flow'
import { type FoodFilter } from '@/contexts/foodFilter'
import { type RouteParams } from '@/contexts/routing'
import { type ThemeHook } from '@/contexts/theme'
import {
    DEFAULT_TIMETABLE_MODE,
    type TimetableHook,
} from '@/contexts/timetable'
import { type UserKindContextType } from '@/contexts/userKind'
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
    setShowStatic: () => {},
    toggleFoodLanguage: () => {},
})

export const UserKindContext = createContext<UserKindContextType>({
    userKind: 'student',
    userFaculty: undefined,
    userFullName: '',
    toggleUserKind: () => {},
    updateUserFullName: () => {},
})

export const ThemeContext = createContext<ThemeHook>({
    theme: 'auto',
    setTheme: () => {},
    accentColor: 'blue',
    setAccentColor: () => {},
})

export const AppIconContext = createContext<AppIconHook>({
    appIcon: 'default',
    unlockedAppIcons: [],
    setAppIcon: () => {},
    addUnlockedAppIcon: () => {},
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

export const FlowContext = createContext<FlowHook>({
    isOnboarded: true,
    setOnboarded: () => {},
    isUpdated: true,
    setUpdated: () => {},
    analyticsAllowed: false,
    setAnalyticsAllowed: () => {},
    analyticsInitialized: false,
    initializeAnalytics: () => {},
})

export const TimetableContext = createContext<TimetableHook>({
    timetableMode: DEFAULT_TIMETABLE_MODE,
    setTimetableMode: () => {},
    selectedDate: new Date(),
    setSelectedDate: () => {},
})
