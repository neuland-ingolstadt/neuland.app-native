import PlatformIcon from '@/components/Elements/Universal/Icon'
import { MaterialBottomTabs } from '@/components/Elements/Universal/MaterialBottomTabs'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    FlowContext,
    FoodFilterContext,
} from '@/components/contexts'
import changelog from '@/data/changelog.json'
import i18n from '@/localization/i18n'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import Aptabase from '@aptabase/react-native'
import { type Theme, useTheme } from '@react-navigation/native'
import Color from 'color'
import * as NavigationBar from 'expo-navigation-bar'
import { usePathname, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Easing } from 'react-native'
// @ts-expect-error no types
import Shortcuts, { type ShortcutItem } from 'rn-quick-actions'

import { humanLocations } from '../(food)/meal'
import packageInfo from '../../../package.json'

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const isDark = theme.dark
    const router = useRouter()
    const colors = theme.colors as Colors
    const flow = React.useContext(FlowContext)
    const { t } = useTranslation('navigation')
    const { selectedRestaurants } = useContext(FoodFilterContext)
    const aptabaseKey = process.env.EXPO_PUBLIC_APTABASE_KEY
    const { analyticsAllowed, initializeAnalytics } =
        React.useContext(FlowContext)
    const { shownDashboardEntries } = React.useContext(DashboardContext)
    const [isFirstRun, setIsFirstRun] = React.useState<boolean>(true)
    if (flow.isOnboarded === false) {
        router.navigate('(flow)/onboarding')
        void SplashScreen.hideAsync()
    }

    const isChangelogAvailable = Object.keys(changelog.version).some(
        (version) => version === convertToMajorMinorPatch(packageInfo.version)
    )

    const { isOnboarded } = React.useContext(FlowContext)

    if (
        flow.isUpdated === false &&
        isChangelogAvailable &&
        flow.isOnboarded !== false
    ) {
        router.navigate('(flow)/whatsnew')
        void SplashScreen.hideAsync()
    }

    useEffect(() => {
        const prepare = async (): Promise<void> => {
            await SplashScreen.preventAutoHideAsync()

            if (shownDashboardEntries !== null && isOnboarded === true) {
                await SplashScreen.hideAsync()
            }
        }
        void prepare()
    }, [shownDashboardEntries, isOnboarded])

    const pathname = usePathname()

    useEffect(() => {
        const prepare = async (): Promise<void> => {
            const tabsPaths = ['/', '/timetable', '/map', '/food']
            const isTab = tabsPaths.includes(pathname)

            await NavigationBar.setBackgroundColorAsync(
                isTab
                    ? isDark
                        ? Color(colors.card)
                              .mix(Color(colors.primary), 0.04)
                              .hex()
                        : Color(colors.card)
                              .mix(Color(colors.primary), 0.1)
                              .hex()
                    : colors.background
            )
            await NavigationBar.setButtonStyleAsync(
                theme.dark ? 'light' : 'dark'
            )
        }

        void prepare()
    }, [theme.dark, pathname])

    const shortcuts = [
        {
            id: 'timetable',
            type: 'timetable',
            title: t('navigation.timetable'),
            symbolName: 'calendar',
            iconName: 'calendar_month',
            data: {
                path: '(tabs)/timetable',
            },
        },
        {
            id: 'map',
            type: 'map',
            title: t('navigation.map'),
            data: {
                path: '(tabs)/map',
            },
            symbolName: 'map',
            iconName: 'map',
        },
        {
            id: 'food',
            type: 'food',
            title:
                selectedRestaurants.length !== 1
                    ? t('navigation.food')
                    : humanLocations[
                          selectedRestaurants[0] as keyof typeof humanLocations
                      ],
            data: {
                path: '(tabs)/food',
            },
            symbolName: 'fork.knife',
            iconName: 'silverware_fork_knife',
        },
    ]

    useEffect(() => {
        function processShortcut(item: ShortcutItem): void {
            router.navigate(item.data.path as string)
            router.setParams({ fromAppShortcut: 'true' })
        }

        const shortcutSubscription =
            Shortcuts.onShortcutPressed(processShortcut)
        Shortcuts.setShortcuts(shortcuts)

        return () => {
            if (shortcutSubscription != null) shortcutSubscription.remove()
        }
    }, [selectedRestaurants, router, shortcuts, i18n.language])

    useEffect(() => {
        if (isFirstRun) {
            setIsFirstRun(false)
            return
        }
        if (aptabaseKey != null && analyticsAllowed === true) {
            Aptabase.init(aptabaseKey, {
                host: 'https://analytics.neuland.app',
            })
            initializeAnalytics()
        } else if (aptabaseKey != null && analyticsAllowed === false) {
            Aptabase.init('')
        } else {
            console.log('Analytics not yet initialized')
        }
    }, [analyticsAllowed])

    return (
        <MaterialBottomTabs
            sceneAnimationEasing={Easing.ease}
            activeColor={colors.text}
            inactiveColor={colors.labelColor}
            activeIndicatorStyle={{
                backgroundColor: isDark
                    ? Color(colors.card)
                          .mix(Color(colors.primary), 0.06)
                          .lighten(1.4)
                          .saturate(1)
                          .hex()
                    : Color(colors.card)
                          .mix(Color(colors.primary), 0.3)
                          .darken(0.05)
                          .saturate(0.1)
                          .hex(),
            }}
            barStyle={{
                backgroundColor: isDark
                    ? Color(colors.card).mix(Color(colors.primary), 0.04).hex()
                    : Color(colors.card).mix(Color(colors.primary), 0.1).hex(),
            }}
        >
            <MaterialBottomTabs.Screen
                name="(index)"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'home',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'house',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />

            <MaterialBottomTabs.Screen
                name="(timetable)"
                options={{
                    title: 'Timetable',
                    tabBarLabel: t('navigation.timetable'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'calendar_month',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'calendar',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />

            <MaterialBottomTabs.Screen
                name="map"
                options={{
                    tabBarLabel: t('navigation.map'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'map',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'map',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />
            <MaterialBottomTabs.Screen
                name="(food)"
                options={{
                    tabBarLabel: t('navigation.food'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'fastfood',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'fork.knife',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />
        </MaterialBottomTabs>
    )
}
