import DefaultTabs from '@/components/Layout/DefaultTabs'
import MaterialTabs from '@/components/Layout/MaterialTabs'
import {
    FlowContext,
    FoodFilterContext,
    PreferencesContext,
    UserKindContext,
} from '@/components/contexts'
import changelog from '@/data/changelog.json'
import { USER_GUEST } from '@/data/constants'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import Aptabase from '@aptabase/react-native'
import { type Theme, useTheme } from '@react-navigation/native'
import * as Application from 'expo-application'
import * as NavigationBar from 'expo-navigation-bar'
import { Redirect, useRouter } from 'expo-router'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
// @ts-expect-error no types
import Shortcuts, { type ShortcutItem } from 'rn-quick-actions'

import { appIcons } from '../(screens)/appIcon'
import { humanLocations } from '../(screens)/meal'

declare const process: {
    env: {
        EXPO_PUBLIC_APTABASE_KEY: string
    }
}

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const router = useRouter()
    const flow = React.useContext(FlowContext)
    const { t } = useTranslation('navigation')
    const { selectedRestaurants } = useContext(FoodFilterContext)
    const { appIcon, setAppIcon } = useContext(PreferencesContext)

    const aptabaseKey = process.env.EXPO_PUBLIC_APTABASE_KEY
    const { analyticsAllowed, initializeAnalytics, analyticsInitialized } =
        React.useContext(FlowContext)
    const { isOnboarded } = React.useContext(FlowContext)
    const { userKind = USER_GUEST } = useContext(UserKindContext)

    // Android only
    const prepare = async (): Promise<void> => {
        void NavigationBar.setPositionAsync('absolute')
        // transparent backgrounds to see through
        void NavigationBar.setBackgroundColorAsync('#ffffff00')
    }
    if (Platform.OS === 'android') {
        void prepare()
    }

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
                    path: '(tabs)/(food)',
                },
                symbolName: 'fork.knife',
                iconName: 'silverware_fork_knife',
            },
            ...(userKind === USER_GUEST
                ? [
                      {
                          id: 'login',
                          type: 'login',
                          title: t('navigation.login'),
                          data: { path: 'login' },
                          symbolName: 'person.circle',
                          iconName: 'account_circle',
                      },
                  ]
                : [
                      {
                          id: 'profile',
                          type: 'profile',
                          title: t('navigation.profile'),
                          data: { path: 'profile' },
                          symbolName: 'person.circle',
                          iconName: 'account_circle',
                      },
                  ]),
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
    }, [selectedRestaurants, router, t, userKind])

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

    const version = Application.nativeApplicationVersion
    const isChangelogAvailable =
        version != null
            ? Object.keys(changelog.version).some(
                  (version) => version === convertToMajorMinorPatch(version)
              )
            : false

    if (
        flow.isUpdated !== true &&
        isChangelogAvailable &&
        flow.isOnboarded === true
    ) {
        router.navigate('(flow)/whatsnew')
    }

    return Platform.OS === 'android' ? (
        <MaterialTabs theme={theme} />
    ) : (
        <DefaultTabs theme={theme} />
    )
}
