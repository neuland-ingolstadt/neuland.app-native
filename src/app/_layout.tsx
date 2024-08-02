import CrashView from '@/components/Elements/Error/CrashView'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { ThemeContext } from '@/components/contexts'
import Provider from '@/components/provider'
import i18n from '@/localization/i18n'
import { storage } from '@/utils/storage'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { getLocales } from 'expo-localization'
import { Stack, useRouter } from 'expo-router'
import { Try } from 'expo-router/build/views/Try'
import Head from 'expo-router/head'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Platform, Pressable, useColorScheme } from 'react-native'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
    initialRouteName: '(index)',
}
function RootLayout(): JSX.Element {
    const router = useRouter()
    const { theme: appTheme } = useContext(ThemeContext)
    const { t } = useTranslation(['navigation'])

    useEffect(() => {
        const loadLanguage = async (): Promise<void> => {
            const savedLanguage = storage.getString('language')
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

    const colors = useTheme().colors as Colors
    const isOsDark = useColorScheme() === 'dark'

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text, i18next/no-literal-string */}
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
                    statusBarStyle: getStatusBarStyle(
                        (appTheme as 'light' | 'dark' | 'auto' | undefined) ??
                            'auto',
                        Platform.OS === 'android',
                        isOsDark
                    ),
                    // Android
                    statusBarTranslucent: true,
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        animation: 'none',
                        gestureEnabled: false,
                    }}
                />

                <Stack.Screen
                    name="(screens)/login"
                    options={{
                        title: 'Account',
                        animation: 'none',
                        gestureEnabled: false,
                        headerShown: false,
                        headerBackVisible: false,
                        headerBackButtonMenuEnabled: false,
                    }}
                />
                <Stack.Screen
                    name="(screens)/settings"
                    options={{
                        title: t('navigation.settings'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/changelog"
                    options={{
                        title: 'Changelog',
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/foodPreferences"
                    options={{
                        title: t('navigation.preferences'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/foodFlags"
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
                    name="(screens)/foodAllergens"
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
                    name="(screens)/meal"
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
                    name="(screens)/lecture"
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
                    name="(screens)/webView"
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
                    name="(screens)/theme"
                    options={{
                        title: t('navigation.theme'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/accent"
                    options={{
                        title: t('navigation.accent'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/appIcon"
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
                    name="(screens)/profile"
                    options={{
                        title: t('navigation.profile'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/about"
                    options={{
                        title: t('navigation.about'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/licenses"
                    options={{
                        title: t('navigation.licenses.title'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/license"
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
                    name="(screens)/dashboard"
                    options={{
                        title: 'Dashboard',
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/grades"
                    options={{
                        title: t('navigation.grades'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/roomSearch"
                    options={{
                        title: t('navigation.advancedSearch'),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="(screens)/clEvents"
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
                    name="(screens)/clEvent"
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
                    name="(screens)/calendar"
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
                    name="(screens)/exam"
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
                    name="(screens)/lecturers"
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
                    name="(screens)/lecturer"
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
                    name="(screens)/library"
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
                                    router.push('(screens)/libraryCode')
                                }}
                                accessibilityLabel={t('button.libraryBarcode', {
                                    ns: 'accessibility',
                                })}
                            >
                                <PlatformIcon
                                    color={colors.text}
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
                    name="(screens)/libraryCode"
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
                    name="(screens)/news"
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
        </>
    )
}

const ProviderComponent = (): JSX.Element => {
    return (
        <Try catch={CrashView}>
            <Provider>
                <RootLayout />
            </Provider>
        </Try>
    )
}

export default ProviderComponent
