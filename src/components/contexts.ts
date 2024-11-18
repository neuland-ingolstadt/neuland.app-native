import { type Dashboard } from '@/contexts/dashboard'
import { type FlowHook } from '@/contexts/flow'
import { type FoodFilter } from '@/contexts/foodFilter'
import { type PreferencesType } from '@/contexts/preferences'
import { type ThemeHook } from '@/contexts/theme'
import { type UserKindContextType } from '@/contexts/userKind'
import { createContext } from 'react'

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
    userCampus: undefined,
    toggleUserKind: () => {},
})

export const ThemeContext = createContext<ThemeHook>({
    theme: 'auto',
    setTheme: () => {},
    accentColor: 'blue',
    setAccentColor: () => {},
})

export const PreferencesContext = createContext<PreferencesType>({
    appIcon: undefined,
    unlockedAppIcons: [],
    setAppIcon: () => {},
    addUnlockedAppIcon: () => {},

    timetableMode: 'list',
    setTimetableMode: () => {},
    selectedDate: new Date(),
    setSelectedDate: () => {},
    recentQuicklinks: [],
    addRecentQuicklink: () => {},
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
