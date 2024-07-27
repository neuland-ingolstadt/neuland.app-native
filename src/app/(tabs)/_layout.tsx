import DefaultTabs from '@/components/Elements/Layout/DefaultTabs'
import MaterialTabs from '@/components/Elements/Layout/MaterialTabs'
import { type Colors } from '@/components/colors'
import {
    AppIconContext,
    FlowContext,
    FoodFilterContext,
} from '@/components/contexts'
import changelog from '@/data/changelog.json'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import Aptabase from '@aptabase/react-native'
import { type Theme, useTheme } from '@react-navigation/native'
import Color from 'color'
import * as NavigationBar from 'expo-navigation-bar'
import { Redirect, usePathname, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
// @ts-expect-error no types
import Shortcuts, { type ShortcutItem } from 'rn-quick-actions'

import { humanLocations } from '../(food)/meal'
import { appIcons } from '../(user)/appicon'
import packageInfo from '../../../package.json'

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const isDark = theme.dark
    const router = useRouter()
    const colors = theme.colors as Colors
    const flow = React.useContext(FlowContext)
    const { t } = useTranslation('navigation')
    const { selectedRestaurants } = useContext(FoodFilterContext)
    const { appIcon, setAppIcon } = useContext(AppIconContext)
    // @ts-expect-error: Env types are not defined
    const aptabaseKey = process.env.EXPO_PUBLIC_APTABASE_KEY as string
    const { analyticsAllowed, initializeAnalytics, analyticsInitialized } =
        React.useContext(FlowContext)
    const { isOnboarded } = React.useContext(FlowContext)
    const pathname = usePathname()

    useEffect(() => {
        const prepare = async (): Promise<void> => {
            if (isOnboarded === true) {
                await SplashScreen.hideAsync()
            }
        }
        void prepare()
    }, [isOnboarded])

    useEffect(() => {
        // Android only: Sets the navigation bar color based on the current screen to match TabBar or Background color
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
        if (Platform.OS === 'android') {
            void prepare()
        }
    }, [theme.dark, pathname, isDark, colors])

    useEffect(() => {
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
    }, [selectedRestaurants, router, appIcon, t])

    useEffect(() => {
        console.log('Analytics allowed:', analyticsAllowed)
        if (aptabaseKey != null && analyticsAllowed === true) {
            Aptabase.init(aptabaseKey, {
                host: 'https://analytics.neuland.app',
            })
            // we need to mark the analytics as initialized to trigger the initial events sent in provider.tsx
            initializeAnalytics()
            console.log('Initialized analytics')
        } else if (
            aptabaseKey != null &&
            analyticsAllowed === false &&
            analyticsInitialized
        ) {
            Aptabase.dispose()
            console.log('Disposed analytics')
        } else {
            console.log('Analytics not initialized / allowed')
        }
    }, [analyticsAllowed])
    useEffect(() => {
        if (Platform.OS !== 'ios') return

        if (!appIcons.includes(appIcon ?? 'default')) {
            setAppIcon('default')
        }
    }, [appIcon])

    if (isOnboarded !== true) {
        return <Redirect href={'onboarding'} />
    }

    const isChangelogAvailable = Object.keys(changelog.version).some(
        (version) => version === convertToMajorMinorPatch(packageInfo.version)
    )

    if (
        flow.isUpdated === false &&
        isChangelogAvailable &&
        flow.isOnboarded !== false
    ) {
        router.navigate('(flow)/whatsnew')
        void SplashScreen.hideAsync()
    }

    return Platform.OS === 'android' ? (
        <MaterialTabs theme={theme} />
    ) : (
        <DefaultTabs theme={theme} />
    )
}
