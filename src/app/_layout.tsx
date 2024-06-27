import PlatformIcon from '@/components/Elements/Universal/Icon'
import { ThemeContext } from '@/components/contexts'
import Provider from '@/components/provider'
import i18n from '@/localization/i18n'
import { getStatusBarIconStyle, getStatusBarStyle } from '@/utils/ui-utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sentry from '@sentry/react-native'
import { getLocales } from 'expo-localization'
import { Stack, useNavigationContainerRef, useRouter } from 'expo-router'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Platform, Pressable, useColorScheme } from 'react-native'

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation()

Sentry.init({
    dsn: sentryDsn,
    enabled: !__DEV__,
    integrations: [
        new Sentry.ReactNativeTracing({
            // Pass instrumentation to be used as `routingInstrumentation`
            routingInstrumentation,
        }),
    ],
    beforeSend(event) {
        delete event.contexts?.app?.device_app_hash
        return event
    },
})

function RootLayout(): JSX.Element {
    const colorScheme = useColorScheme()
    const router = useRouter()
    const { theme: appTheme } = useContext(ThemeContext)
    const { t } = useTranslation('navigation')

    const ref = useNavigationContainerRef()

    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (ref) {
            routingInstrumentation.registerNavigationContainer(ref)
        }
    }, [ref])

    useEffect(() => {
        const loadLanguage = async (): Promise<void> => {
            const savedLanguage = await AsyncStorage.getItem('language')
            if (
                savedLanguage !== null &&
                Platform.OS === 'android' &&
                Platform.Version < 33
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

    return (
        <>
            <Sentry.TouchEventBoundary>
                <Stack
                    screenOptions={{
                        statusBarStyle: getStatusBarStyle(appTheme),
                    }}
                >
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            title: 'Home',
                            headerShown: false,
                            headerLargeTitle: true,
                        }}
                    />
                    <Stack.Screen
                        name="(user)/login"
                        options={{
                            title: 'THI Account',
                            presentation: 'formSheet',
                            gestureEnabled: false,
                            headerBackButtonMenuEnabled: false,
                        }}
                    />
                    <Stack.Screen
                        name="(user)/settings"
                        options={{
                            title: t('navigation.settings'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/changelog"
                        options={{
                            title: 'Changelog',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(food)/preferences"
                        options={{
                            title: t('navigation.preferences'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(food)/flags"
                        options={{
                            headerShown: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(food)/allergens"
                        options={{
                            headerShown: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(food)/meal"
                        options={{
                            title: t('navigation.details'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(timetable)/details"
                        options={{
                            title: t('navigation.details'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(timetable)/webView"
                        options={{
                            title: t('navigation.details'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(user)/theme"
                        options={{
                            title: t('navigation.theme'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/appicon"
                        // @ts-expect-error route params are not typed
                        options={({
                            route,
                        }: {
                            route: {
                                params: { fromAppShortcut: string }
                            }
                        }) => ({
                            title: 'App Icon',
                            animation: 'slide_from_right',
                            presentation:
                                route.params?.fromAppShortcut === 'true'
                                    ? 'modal'
                                    : undefined,
                        })}
                    />
                    <Stack.Screen
                        name="(user)/profile"
                        options={{
                            title: t('navigation.profile'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/about"
                        options={{
                            title: t('navigation.about'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/licenses"
                        options={{
                            title: t('navigation.licenses'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/license"
                        options={{
                            title: t('navigation.license'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(user)/dashboard"
                        options={{
                            title: 'Dashboard',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/grades"
                        options={{
                            title: t('navigation.grades'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(map)/advanced"
                        options={{
                            title: t('navigation.advancedSearch'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/events"
                        options={{
                            title: 'Campus Life Events',
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/event"
                        options={{
                            title: 'Event Details',
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/calendar"
                        options={{
                            title: t('navigation.calendar'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/exam"
                        options={{
                            title: t('navigation.examDetails'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/lecturers"
                        options={{
                            title: t('navigation.lecturers.title'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/lecturer"
                        options={{
                            title: t('navigation.lecturer'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/library"
                        options={{
                            title: t('navigation.library'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),

                            headerRight: () => (
                                <Pressable
                                    onPress={() => {
                                        router.push('(pages)/libraryCode')
                                    }}
                                >
                                    <PlatformIcon
                                        color={getStatusBarIconStyle(
                                            appTheme,
                                            colorScheme
                                        )}
                                        ios={{
                                            name: 'barcode',
                                            size: 22,
                                        }}
                                        android={{
                                            name: 'barcode_scanner',
                                            size: 24,
                                        }}
                                    />
                                </Pressable>
                            ),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/libraryCode"
                        options={{
                            title: t('navigation.libraryCode'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/news"
                        options={{
                            title: t('navigation.news'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    headerTransparent: true,
                                    headerBlurEffect: 'regular',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(flow)/onboarding"
                        options={{
                            headerShown: false,
                            animation: 'none',
                            gestureEnabled: false,
                            ...Platform.select({
                                ios: {
                                    presentation: 'fullScreenModal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(flow)/whatsnew"
                        options={{
                            headerShown: false,
                            gestureEnabled: false,
                            ...Platform.select({
                                ios: {
                                    presentation: 'formSheet',
                                },
                            }),
                        }}
                    />
                </Stack>
            </Sentry.TouchEventBoundary>
        </>
    )
}

const ProviderComponent = (): JSX.Element => {
    return (
        <Provider>
            <RootLayout />
        </Provider>
    )
}

export default Sentry.wrap(ProviderComponent)
