import TabLayout from '@/components/Layout/Tabbar'
import { UserKindContext } from '@/components/contexts'
import changelog from '@/data/changelog.json'
import { USER_GUEST } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useSessionStore } from '@/hooks/useSessionStore'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { humanLocations } from '@/utils/food-utils'
import { storage } from '@/utils/storage'
import Aptabase from '@aptabase/react-native'
import * as Application from 'expo-application'
import { Redirect, type RelativePathString, useRouter } from 'expo-router'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv'
// @ts-expect-error no types available
import Shortcuts, { type ShortcutItem } from 'rn-quick-actions'

import { appIcons } from '../(screens)/app-icon'

interface ShortcutsType {
    onShortcutPressed: (callback: (item: ShortcutItem) => void) => {
        remove: () => void
    }
    setShortcuts: (shortcuts: ShortcutItem[]) => void
}

const TypedShortcuts = Shortcuts as unknown as ShortcutsType

declare const process: {
    env: {
        EXPO_PUBLIC_APTABASE_KEY: string
    }
}

export default function HomeLayout(): React.JSX.Element {
    const router = useRouter()

    const { t } = useTranslation('navigation')
    const selectedRestaurants = useFoodFilterStore(
        (state) => state.selectedRestaurants
    )
    const appIcon = usePreferencesStore((state) => state.appIcon)
    const setAppIcon = usePreferencesStore((state) => state.setAppIcon)
    const aptabaseKey = process.env.EXPO_PUBLIC_APTABASE_KEY

    const analyticsInitialized = useSessionStore(
        (state) => state.analyticsInitialized
    )
    const initializeAnalytics = useSessionStore(
        (state) => state.initializeAnalytics
    )
    const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
    const setAnalyticsAllowed = useFlowStore(
        (state) => state.setAnalyticsAllowed
    )
    const isOnboarded = useFlowStore((state) => state.isOnboarded)
    const setOnboarded = useFlowStore((state) => state.setOnboarded)
    const toggleSelectedAllergens = useFoodFilterStore(
        (state) => state.toggleSelectedAllergens
    )
    const setAccentColor = usePreferencesStore((state) => state.setAccentColor)
    const { userKind: userKindInitial } = useContext(UserKindContext)
    const userKind = userKindInitial ?? USER_GUEST
    const updatedVersion = useFlowStore((state) => state.updatedVersion)
    const [isOnboardedV1] = useMMKVBoolean('isOnboardedv1')
    const [analyticsV1] = useMMKVBoolean('analytics')
    const oldAllergens = storage.getString('selectedUserAllergens')
    const [oldAccentColor] = useMMKVString('accentColor')
    // migration of old settings
    if (isOnboardedV1 === true) {
        setOnboarded()
        storage.delete('isOnboardedv1')
    }
    if (analyticsV1 === true) {
        setAnalyticsAllowed(true)
        storage.delete('analytics')
    }
    if (oldAccentColor != null) {
        setAccentColor(oldAccentColor)
        storage.delete('accentColor')
    }
    if (oldAllergens != null) {
        const allergens = JSON.parse(oldAllergens) as string[]
        if (allergens.length === 1 && allergens[0] === 'not-configured') {
            /* empty */
        } else {
            allergens.forEach((allergen: string) => {
                console.debug('Migrating allergen:', allergen)
                toggleSelectedAllergens(allergen)
            })
        }
        storage.delete('selectedUserAllergens')
    }

    const version = Application.nativeApplicationVersion
    const processedVersion = convertToMajorMinorPatch(version ?? '0.0.0')
    const isChangelogAvailable =
        version != null
            ? Object.keys(changelog.version).some(
                  (changelogVersion) => changelogVersion === processedVersion
              )
            : false

    useEffect(() => {
        if (Platform.OS === 'web') {
            return
        }

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
            router.navigate({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                pathname: item.data.path as RelativePathString,
                params: { fromAppShortcut: 'true' },
            })
        }

        const shortcutSubscription =
            TypedShortcuts.onShortcutPressed(processShortcut)
        TypedShortcuts.setShortcuts(shortcuts)

        return () => {
            if (shortcutSubscription != null) shortcutSubscription.remove()
        }
    }, [selectedRestaurants, router, t, userKind])

    useEffect(() => {
        console.debug('Analytics allowed:', analyticsAllowed)
        if (aptabaseKey != null && analyticsAllowed === true) {
            Aptabase.init(aptabaseKey, {
                host: 'https://analytics.neuland.app',
            })
            // we need to mark the analytics as initialized to trigger the initial events sent in provider.tsx
            initializeAnalytics()
            console.debug('Initialized analytics')
        } else if (
            aptabaseKey != null &&
            analyticsAllowed === false &&
            analyticsInitialized
        ) {
            Aptabase.dispose()
            console.debug('Disposed analytics')
        } else {
            console.debug('Analytics not initialized / allowed')
        }
    }, [analyticsAllowed])
    useEffect(() => {
        if (Platform.OS !== 'ios') return

        if (!appIcons.includes(appIcon ?? 'default')) {
            setAppIcon('default')
        }
    }, [appIcon])

    if (Platform.OS === 'web') {
        if (userKindInitial === undefined) {
            return <Redirect href={'/login'} />
        }
    } else {
        if (isOnboarded !== true) {
            return <Redirect href={'/onboarding'} />
        }

        if (
            updatedVersion !== processedVersion &&
            isChangelogAvailable &&
            isOnboarded
        ) {
            return <Redirect href={'/whatsnew'} />
        }
    }

    return <TabLayout />
}
