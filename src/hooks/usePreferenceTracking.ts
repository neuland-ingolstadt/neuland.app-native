import { trackEvent } from '@aptabase/react-native'
import { useSegments } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useDashboard, useUserKind } from '@/contexts'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useSessionStore } from '@/hooks/useSessionStore'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import i18n from '@/localization/i18n'

export function usePreferenceTracking(): void {
	const segments = useSegments()
	const theme = usePreferencesStore((state) => state.theme)
	const showSplashScreen = usePreferencesStore(
		(state) => state.showSplashScreen
	)
	const appIcon = usePreferencesStore((state) => state.appIcon)
	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
	const timetableMode = useTimetableStore((state) => state.timetableMode)
	const analyticsInitialized = useSessionStore(
		(state) => state.analyticsInitialized
	)
	const userKind = useUserKind()
	const dashboard = useDashboard()

	useEffect(() => {
		if (!analyticsInitialized || !Array.isArray(segments)) return
		const lastSegment = segments[segments.length - 1]
		const path =
			typeof lastSegment === 'string'
				? `/${lastSegment.replace(/[()]/g, '')}`
				: '/'
		requestAnimationFrame(() => {
			trackEvent('Route', { path })
		})
	}, [segments, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('Theme', { theme })
	}, [theme, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('SplashScreen', { showSplashScreen })
	}, [showSplashScreen, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		if (Platform.OS === 'ios') {
			trackEvent('AppIcon', { appIcon: appIcon ?? 'default' })
		}
	}, [appIcon, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized || userKind.userKind === undefined) return
		trackEvent('UserKind', { userKind: userKind.userKind })
	}, [userKind.userKind, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('SelectedRestaurants', {
			selectedRestaurants: selectedRestaurants.join(',')
		})
	}, [selectedRestaurants, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		const entries: Record<string, string> = {}
		dashboard.shownDashboardEntries.forEach((entry, index) => {
			if (entry !== undefined) {
				entries[entry.key] = `Position ${(index + 1).toString()}`
			}
		})
		if (Object.keys(entries).length > 0) {
			trackEvent('Dashboard', entries)
		}
	}, [dashboard.shownDashboardEntries, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('Language', { food: foodLanguage })
	}, [foodLanguage, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('Language', { app: i18n.language })
	}, [i18n.language, analyticsInitialized])

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('TimetableMode', { timetableMode: timetableMode ?? 'list' })
	}, [timetableMode, analyticsInitialized])
}
