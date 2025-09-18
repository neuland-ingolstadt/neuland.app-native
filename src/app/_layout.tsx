import CrashView from '@/components/Error/crash-view'
import Provider from '@/components/provider'
import { Splash } from '@/components/Splash'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { usePresentationMode } from '@/hooks/usePresentationMode'
import { useTransparentHeaderStyle } from '@/hooks/useTransparentHeader'
import i18n from '@/localization/i18n'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import '@/styles/unistyles'
import { getLocales } from 'expo-localization'
import { useQuickActionRouting } from 'expo-quick-actions/router'
import { type Href, router, Stack } from 'expo-router'
import { Try } from 'expo-router/build/views/Try'
import Head from 'expo-router/head'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, LogBox, Platform } from 'react-native'
import { configureReanimatedLogger } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

configureReanimatedLogger({
	strict: false
})

export const unstable_settings = {
	// Ensure any route can link back to `/`
	initialRouteName: 'index'
}
// Ignore common React Native warnings
LogBox.ignoreLogs([
	/VirtualizedLists should never be nested inside plain ScrollViews/, // avoid nested list warnings
	/Invalid prop `isParentDetached` supplied to .*React\.Fragment/ // ignore isParentDetached fragment prop warning
])

function RootLayout(): React.JSX.Element {
	const { t } = useTranslation(['navigation'])
	const savedLanguage = usePreferencesStore((state) => state.language)
	const presentationMode = usePresentationMode()
	const smallSheetPresentationMode = usePresentationMode(true)
	const transparentHeaderStyle = useTransparentHeaderStyle()

	useQuickActionRouting()

	useEffect(() => {
		const handleOpenURL = (event: { url: string }) => {
			const bases = ['https://dev.neuland.app', 'https://web.neuland.app/']

			const matchingBase = bases.find((base) => event.url.startsWith(base))
			if (matchingBase) {
				// Remove the base URL and any trailing slashes, but keep the rest of the path and query params
				const fullPath = event.url.replace(matchingBase, '').replace(/^\/+/, '')

				if (fullPath) {
					router.navigate(fullPath as Href)
				}
			}
		}

		Linking.getInitialURL().then((url) => {
			if (url) {
				handleOpenURL({ url })
			}
		})

		// Handle subsequent URLs when app is in foreground
		const linkingSubscription = Linking.addEventListener('url', handleOpenURL)

		return () => {
			linkingSubscription.remove()
		}
	}, [])

	useEffect(() => {
		const loadLanguage = async (): Promise<void> => {
			if (
				savedLanguage !== null &&
				((Platform.OS === 'android' && Platform.Version < 33) ||
					Platform.OS === 'web')
			) {
				await i18n.changeLanguage(savedLanguage)
			}
		}

		void loadLanguage()
	}, [])

	useEffect(() => {
		const changeLanguage = async (): Promise<void> => {
			const locale = getLocales()[0]
			const language = locale.languageCode
			if (language === 'de' || language === 'en')
				await i18n.changeLanguage(language)
		}

		const handleAppStateChange = (nextAppState: string): void => {
			if (nextAppState === 'active') {
				void changeLanguage()
			}
		}

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		)

		return () => {
			subscription.remove()
		}
	}, [])
	const { styles, theme: uniTheme } = useStyles(stylesheet)

	const [isReady, setIsReady] = useState(false)
	useEffect(() => {
		setIsReady(true)
	}, [])

	return (
		<Splash isReady={isReady}>
			<Head>
				<title>Neuland Next</title>
				<meta
					name="description"
					content="An unofficial campus app for TH Ingolstadt"
				/>
				<meta
					property="og:description"
					content="An unofficial campus app for TH Ingolstadt"
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<Stack
				screenOptions={{
					contentStyle: styles.background,
					headerStyle: styles.headerBackground,
					headerTintColor: uniTheme.colors.primary,
					headerTitleStyle: styles.headerTextStyle
				}}
			>
				<Stack.Screen
					name="(tabs)"
					options={{
						title: 'Home',
						headerShown: false,
						animation: 'none',
						gestureEnabled: false
					}}
				/>
				<Stack.Screen
					name="index"
					options={{
						title: 'Home',
						headerShown: false,
						animation: 'none',
						gestureEnabled: false
					}}
				/>

				<Stack.Screen
					name="(screens)/login"
					options={{
						title: 'Neuland Next Login',
						animation: 'none',
						gestureEnabled: false,
						headerShown: false,
						headerBackVisible: false,
						headerBackButtonMenuEnabled: false
					}}
				/>
				<Stack.Screen
					name="(screens)/changelog"
					options={{
						title: 'Changelog'
					}}
				/>
				<Stack.Screen
					name="(screens)/food-preferences"
					options={{
						title: t('navigation.preferences'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/food-flags"
					options={{
						headerShown: false,
						...Platform.select({
							ios: {
								presentation: 'modal'
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/food-allergens"
					options={{
						headerShown: false,
						...Platform.select({
							ios: {
								presentation: 'modal'
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/food/[id]"
					options={{
						title: t('navigation.details'),
						...Platform.select({
							ios: {
								...presentationMode
							}
						}),
						...getPlatformHeaderButtons({
							onShare: () => {
								/* do nothing yet */
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/lecture"
					options={{
						title: t('navigation.details'),
						...Platform.select({
							ios: {
								...presentationMode
							}
						}),
						...getPlatformHeaderButtons({
							onShare: () => {
								/* do nothing yet */
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/webview"
					options={{
						title: t('navigation.details'),
						...Platform.select({
							ios: {
								presentation: 'modal'
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/theme"
					options={{
						title: t('navigation.theme'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/timetable-preferences"
					options={{
						title: t('navigation.timetablePreferences'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/app-icon"
					options={{
						title: 'App Icon'
					}}
				/>
				<Stack.Screen
					name="(screens)/profile"
					options={{
						title: t('navigation.profile')
					}}
				/>
				<Stack.Screen
					name="(screens)/about"
					options={{
						title: t('navigation.about'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/version"
					options={{
						title: 'Version Details'
					}}
				/>
				<Stack.Screen
					name="(screens)/legal"
					options={{
						title: t('navigation.legal'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/licenses"
					options={{
						title: t('navigation.licenses.title'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/license"
					options={{
						title: t('navigation.license'),
						...Platform.select({
							ios: {
								presentation: 'modal'
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/dashboard"
					options={{
						title: 'Dashboard',
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/grades"
					options={{
						title: t('navigation.grades.title')
					}}
				/>
				<Stack.Screen
					name="(screens)/room-search"
					options={{
						title: t('navigation.advancedSearch'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/cl-events"
					options={{
						title: 'Campus Life Events',
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/member"
					options={{
						title: t('navigation.neulandMember')
					}}
				/>
				<Stack.Screen
					name="(screens)/events/counselling/[id]"
					options={{
						title: 'Event Details',
						...Platform.select({
							ios: {
								...presentationMode
							}
						}),
						...getPlatformHeaderButtons({
							onShare: () => {
								/* do nothing yet */
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/events/career/[id]"
					options={{
						title: 'Event Details',
						...Platform.select({
							ios: {
								...presentationMode
							}
						}),
						...getPlatformHeaderButtons({
							onShare: () => {
								/* do nothing yet */
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/thi-services"
					options={{
						title: t('navigation.thiServices'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/calendar"
					options={{
						title: t('navigation.calendar'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/exam"
					options={{
						title: t('navigation.examDetails'),
						...Platform.select({
							ios: {
								...presentationMode,
								...getPlatformHeaderButtons({
									noShare: true
								})
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/links"
					options={{
						title: t('navigation.quicklinks'),
						...Platform.select({
							ios: {
								...smallSheetPresentationMode,
								...getPlatformHeaderButtons({
									noShare: true
								})
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/dots"
					options={{
						title: t('navigation.dots'),
						...Platform.select({
							ios: {
								...smallSheetPresentationMode,
								...getPlatformHeaderButtons({
									noShare: true
								})
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/lecturers"
					options={{
						title: t('navigation.lecturers.title')
					}}
				/>
				<Stack.Screen
					name="(screens)/lecturer"
					options={{
						title: t('navigation.lecturer'),
						...Platform.select({
							ios: {
								presentation: 'modal'
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/library"
					options={{
						title: t('navigation.libraryCode')
					}}
				/>
				<Stack.Screen
					name="(screens)/news"
					options={{
						title: t('navigation.news'),
						...transparentHeaderStyle
					}}
				/>
				<Stack.Screen
					name="(screens)/onboarding"
					options={{
						headerShown: false,

						animation: 'none',
						gestureEnabled: false,
						...Platform.select({
							ios: {
								presentation: 'fullScreenModal'
							}
						})
					}}
				/>

				<Stack.Screen
					name="(screens)/whatsnew"
					options={{
						headerShown: false,
						gestureEnabled: false,
						animation: 'fade_from_bottom'
					}}
				/>

				<Stack.Screen
					name="(screens)/room-report"
					options={{
						title: t('navigation.roomReport'),
						...Platform.select({
							ios: {
								presentation: 'modal'
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/events/cl/[id]"
					options={{
						title: 'Event Details',
						...Platform.select({
							ios: {
								...presentationMode
							}
						}),
						...getPlatformHeaderButtons({
							onShare: () => {
								/* do nothing yet */
							}
						})
					}}
				/>
				<Stack.Screen
					name="(screens)/events/sports/[id]"
					options={{
						title: 'Event Details',
						...Platform.select({
							ios: {
								...presentationMode
							}
						}),
						...getPlatformHeaderButtons({
							onShare: () => {
								/* do nothing yet */
							}
						})
					}}
				/>
			</Stack>
		</Splash>
	)
}

const ProviderComponent = (): React.JSX.Element => {
	return (
		<Try catch={CrashView}>
			<Provider>
				<RootLayout />
			</Provider>
		</Try>
	)
}

export default ProviderComponent
const stylesheet = createStyleSheet((theme) => ({
	background: { backgroundColor: theme.colors.background },
	headerBackground: { backgroundColor: theme.colors.card },
	headerTextStyle: { color: theme.colors.text }
}))
