import CrashView from '@/components/Error/CrashView'
import PlatformIcon from '@/components/Universal/Icon'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import Provider from '@/components/provider'
import i18n from '@/localization/i18n'
import '@/styles/unistyles'
import { storage } from '@/utils/storage'
import { getLocales } from 'expo-localization'
import { Stack, useRouter } from 'expo-router'
import { Try } from 'expo-router/build/views/Try'
import Head from 'expo-router/head'
import * as ScreenOrientation from 'expo-screen-orientation'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Platform, Pressable } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { SystemBars } from 'react-native-edge-to-edge'
import { configureReanimatedLogger } from 'react-native-reanimated'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

configureReanimatedLogger({
    strict: false,
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
    initialRouteName: '(index)',
}

function RootLayout(): JSX.Element {
    const router = useRouter()
    const { t } = useTranslation(['navigation'])
    const isPad = DeviceInfo.isTablet()

    useEffect(() => {
        if (isPad) {
            void ScreenOrientation.unlockAsync()
        } else {
            void ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            )
        }
    }, [isPad])

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
    const { styles, theme: uniTheme } = useStyles(stylesheet)
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
            {Platform.OS === 'android' && (
                <SystemBars
                    style={
                        UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark'
                    }
                />
            )}
            <Stack
                screenOptions={{
                    contentStyle: styles.background,
                    headerStyle: styles.headerBackground,
                    headerTintColor: uniTheme.colors.primary,
                    headerTitleStyle: styles.headerTextStyle,
                }}
            >
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
                    }}
                />
                <Stack.Screen
                    name="(screens)/changelog"
                    options={{
                        title: 'Changelog',
                    }}
                />
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="(screens)/foodPreferences"
                    options={{
                        title: t('navigation.preferences'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/foodFlags"
                    options={{
                        headerShown: false,
                        ...Platform.select({
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
                            ios: {
                                presentation: 'modal',
                            },
                        }),
                        headerRight: () => (
                            <ShareHeaderButton onPress={() => {}} />
                        ),
                    }}
                />
                <Stack.Screen
                    name="(screens)/lecture"
                    options={{
                        title: t('navigation.details'),
                        ...Platform.select({
                            ios: {
                                presentation: 'modal',
                            },
                        }),
                        headerRight: () => (
                            <ShareHeaderButton onPress={() => {}} />
                        ),
                    }}
                />
                <Stack.Screen
                    name="(screens)/webView"
                    options={{
                        title: t('navigation.details'),
                        ...Platform.select({
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
                    }}
                />
                <Stack.Screen
                    name="(screens)/accent"
                    options={{
                        title: t('navigation.accent'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/appIcon"
                    options={{
                        title: 'App Icon',
                    }}
                />
                <Stack.Screen
                    name="(screens)/profile"
                    options={{
                        title: t('navigation.profile'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/about"
                    options={{
                        title: t('navigation.about'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/legal"
                    options={{
                        title: t('navigation.legal'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/licenses"
                    options={{
                        title: t('navigation.licenses.title'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/license"
                    options={{
                        title: t('navigation.license'),
                        ...Platform.select({
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
                    }}
                />
                <Stack.Screen
                    name="(screens)/grades"
                    options={{
                        title: t('navigation.grades'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/roomSearch"
                    options={{
                        title: t('navigation.advancedSearch'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/clEvents"
                    options={{
                        title: 'Campus Life Events',
                    }}
                />
                <Stack.Screen
                    name="(screens)/sportsEvent"
                    options={{
                        title: 'Event Details',
                        ...Platform.select({
                            ios: {
                                presentation: 'modal',
                            },
                        }),
                        headerRight: () => (
                            <ShareHeaderButton onPress={() => {}} />
                        ),
                    }}
                />
                <Stack.Screen
                    name="(screens)/clEvent"
                    options={{
                        title: 'Event Details',
                        ...Platform.select({
                            ios: {
                                presentation: 'modal',
                            },
                        }),
                        headerRight: () => (
                            <ShareHeaderButton onPress={() => {}} />
                        ),
                    }}
                />
                <Stack.Screen
                    name="(screens)/calendar"
                    options={{
                        title: t('navigation.calendar'),
                    }}
                />
                <Stack.Screen
                    name="(screens)/exam"
                    options={{
                        title: t('navigation.examDetails'),
                        ...Platform.select({
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
                    }}
                />
                <Stack.Screen
                    name="(screens)/lecturer"
                    options={{
                        title: t('navigation.lecturer'),
                        ...Platform.select({
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

                        headerRight: () => (
                            <Pressable
                                onPressOut={() => {
                                    router.navigate('/libraryCode')
                                }}
                                accessibilityLabel={t('button.libraryBarcode', {
                                    ns: 'accessibility',
                                })}
                            >
                                <PlatformIcon
                                    style={styles.headerTextStyle}
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
                            ios: {
                                headerStyle: undefined,
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
                        animation: 'fade_from_bottom',
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
const stylesheet = createStyleSheet((theme) => ({
    background: { backgroundColor: theme.colors.background },
    headerBackground: { backgroundColor: theme.colors.card },
    headerTextStyle: { color: theme.colors.text },
}))
