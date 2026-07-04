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
import { useCSSVariable, useUniwind } from 'uniwind'
import { FeatureFlagsProvider, useDashboard, useUserKind } from '@/contexts'
import { useAppState, useOnlineManager } from '@/hooks'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { usePreferenceTracking } from '@/hooks/usePreferenceTracking'
import { useUniwindThemeSync } from '@/hooks/useUniwindThemeSync'
import { ensureFliptClient } from '@/lib/flipt'
import { syncStoragePersister } from '@/utils/storage'
import { toColor } from '@/utils/uniwind-utils'
import { DashboardContext, UserKindContext } from './contexts'

interface ProviderProps {
	children: React.ReactNode
}

const QUERY_PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24

function onAppStateChange(status: AppStateStatus): void {
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

function NavigationThemeProvider({
	children
}: ProviderProps): React.JSX.Element {
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const borderColor = String(
		toColor(useCSSVariable('--color-border')) ?? '#d8d8d8'
	)

	const navigationTheme = isDark
		? {
				...DarkTheme,
				colors: {
					...DarkTheme.colors,
					background: backgroundColor,
					card: cardColor,
					text: textColor,
					primary: primaryColor,
					border: borderColor
				}
			}
		: {
				...DefaultTheme,
				colors: {
					...DefaultTheme.colors,
					background: backgroundColor,
					card: cardColor,
					text: textColor,
					primary: primaryColor,
					border: borderColor
				}
			}

	return <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
}

function ProviderContent({ children }: ProviderProps): React.JSX.Element {
	const theme = usePreferencesStore((state) => state.theme)

	useUniwindThemeSync()

	useEffect(() => {
		const subscription = Appearance.addChangeListener(() => {
			/* nothing to do here */
		})

		const isFixedTheme = theme === 'dark' || theme === 'light'
		if (Platform.OS !== 'web') {
			Appearance.setColorScheme(isFixedTheme ? theme : undefined)
		}

		return () => {
			subscription.remove()
		}
	}, [theme])

	return (
		<NavigationThemeProvider>
			<BottomSheetModalProvider>
				<FeatureFlagsProvider>
					<AppContexts>{children}</AppContexts>
				</FeatureFlagsProvider>
			</BottomSheetModalProvider>
		</NavigationThemeProvider>
	)
}

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
