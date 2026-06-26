import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider
} from '@react-navigation/native'
import { focusManager, QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Toaster } from 'burnt/web'
import type React from 'react'
import { useEffect } from 'react'
import {
	Appearance,
	type AppStateStatus,
	Platform,
	StyleSheet
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { UnistylesProvider, UnistylesRuntime } from 'react-native-unistyles'
import { FeatureFlagsProvider, useDashboard, useUserKind } from '@/contexts'
import { useAppState, useOnlineManager } from '@/hooks'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { usePreferenceTracking } from '@/hooks/usePreferenceTracking'
import { useUniwindThemeSync } from '@/hooks/useUniwindThemeSync'
import { ensureFliptClient } from '@/lib/flipt'
import { themeColorMap } from '@/styles/theme-colors'
import { syncStoragePersister } from '@/utils/storage'
import { DashboardContext, UserKindContext } from './contexts'

interface ProviderProps {
	children: React.ReactNode
}

const QUERY_PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24

function onAppStateChange(status: AppStateStatus): void {
	// React Query already supports in web browser refetch on window focus by default
	if (Platform.OS !== 'web') {
		focusManager.setFocused(status === 'active')
	}
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			gcTime: QUERY_PERSIST_MAX_AGE_MS
		}
	}
})

/**
 * App contexts that depend on feature flags and the dashboard.
 */
function AppContexts({ children }: ProviderProps): React.JSX.Element {
	const userKind = useUserKind()
	const dashboard = useDashboard()

	usePreferenceTracking()

	return (
		<UserKindContext.Provider value={userKind}>
			<DashboardContext.Provider value={dashboard}>
				<Toaster />
				{children}
			</DashboardContext.Provider>
		</UserKindContext.Provider>
	)
}

/**
 * Inner provider tree — must render inside PersistQueryClientProvider because
 * feature flags are evaluated via React Query.
 */
function ProviderContent({ children }: ProviderProps): React.JSX.Element {
	const theme = usePreferencesStore((state) => state.theme)
	const themeColor = usePreferencesStore((state) => state.themeColor)

	useUniwindThemeSync()

	useEffect(() => {
		const subscription = Appearance.addChangeListener(() => {
			/* nothing to do here */
		})

		const isFixedTheme = theme === 'dark' || theme === 'light'
		if (Platform.OS !== 'web') {
			Appearance.setColorScheme(isFixedTheme ? theme : undefined)
		}

		UnistylesRuntime.setAdaptiveThemes(!isFixedTheme)
		if (isFixedTheme) {
			UnistylesRuntime.setTheme(theme)
		}

		return () => {
			subscription.remove()
		}
	}, [theme])

	useEffect(() => {
		const colors = themeColorMap[themeColor]
		UnistylesRuntime.updateTheme('light', (t) => ({
			...t,
			colors: {
				...t.colors,
				primary: colors.light,
				secondary: colors.light,
				primaryBackground: `${colors.light}15`
			}
		}))
		UnistylesRuntime.updateTheme('dark', (t) => ({
			...t,
			colors: {
				...t.colors,
				primary: colors.dark,
				secondary: colors.dark,
				primaryBackground: `${colors.dark}25`
			}
		}))
	}, [themeColor])

	return (
		<UnistylesProvider>
			<ThemeProvider
				value={UnistylesRuntime.themeName === 'dark' ? DarkTheme : DefaultTheme}
			>
				<BottomSheetModalProvider>
					<FeatureFlagsProvider>
						<AppContexts>{children}</AppContexts>
					</FeatureFlagsProvider>
				</BottomSheetModalProvider>
			</ThemeProvider>
		</UnistylesProvider>
	)
}

/**
 * Provider component that wraps the entire app and provides context for theme, user kind, and food filter.
 * @param children - The child components to be wrapped by the Provider.
 * @param rest - Additional props to be passed to the Provider.
 * @returns The Provider component.
 */
export default function Provider({
	children
}: ProviderProps): React.JSX.Element {
	useOnlineManager()
	useAppState(onAppStateChange)

	useEffect(() => {
		void ensureFliptClient()
	}, [])

	return (
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{
						persister: syncStoragePersister,
						maxAge: QUERY_PERSIST_MAX_AGE_MS
					}}
				>
					<ProviderContent>{children}</ProviderContent>
				</PersistQueryClientProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
})
