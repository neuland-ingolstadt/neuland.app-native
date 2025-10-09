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
import { useAppState, useOnlineManager } from '@/hooks'
import {
	type ThemeColor,
	usePreferencesStore
} from '@/hooks/usePreferencesStore'
import { usePreferenceTracking } from '@/hooks/usePreferenceTracking'
import { darkTheme, lightTheme } from '@/styles/themes'
import { syncStoragePersister } from '@/utils/storage'
import { useDashboard, useUserKind } from '../contexts'
import { DashboardContext, UserKindContext } from './contexts'

interface ProviderProps {
	children: React.ReactNode
}

function onAppStateChange(status: AppStateStatus): void {
	// React Query already supports in web browser refetch on window focus by default
	if (Platform.OS !== 'web') {
		focusManager.setFocused(status === 'active')
	}
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2
		}
	}
})

export const themeColorMap: Record<
	ThemeColor,
	{ light: string; dark: string }
> = {
	blue: { light: lightTheme.colors.primary, dark: darkTheme.colors.primary },
	green: { light: '#2bbb4f', dark: '#1beb4f' },
	purple: { light: '#990eda', dark: '#9e10f0' }
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
	const userKind = useUserKind()
	const dashboard = useDashboard()

	useOnlineManager()
	useAppState(onAppStateChange)
	const theme = usePreferencesStore((state) => state.theme)
	const themeColor = usePreferencesStore((state) => state.themeColor)

	usePreferenceTracking()

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
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{ persister: syncStoragePersister }}
				>
					<UnistylesProvider>
						<ThemeProvider
							value={
								UnistylesRuntime.themeName === 'dark' ? DarkTheme : DefaultTheme
							}
						>
							<BottomSheetModalProvider>
								<UserKindContext.Provider value={userKind}>
									<DashboardContext.Provider value={dashboard}>
										<Toaster />
										{children}
									</DashboardContext.Provider>
								</UserKindContext.Provider>
							</BottomSheetModalProvider>
						</ThemeProvider>
					</UnistylesProvider>
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
