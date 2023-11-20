import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { FlowContext, FoodFilterContext } from '@/components/provider'
import changelog from '@/data/changelog.json'
import { convertToMajorMinorPatch, processShortcut } from '@/utils/app-utils'
import { type Theme, useTheme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import { Tabs, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet } from 'react-native'
// @ts-expect-error Mssing types for rn-quick-actions
import Shortcuts from 'rn-quick-actions'

import packageInfo from '../../../package.json'

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const router = useRouter()
    const colors = theme.colors as Colors
    const flow = React.useContext(FlowContext)
    const { t } = useTranslation('navigation')
    const { selectedRestaurants } = useContext(FoodFilterContext)
    if (flow.isOnboarded === false) {
        console.log('redirecting to onboard')
        router.push('(flow)/onboarding')
    }

    const isChangelogAvailable = Object.keys(changelog.version).some(
        (version) => version === convertToMajorMinorPatch(packageInfo.version)
    )
    if (
        flow.isUpdated === false &&
        isChangelogAvailable &&
        flow.isOnboarded !== false
    ) {
        console.log('redirecting to whatsnew')
        router.push('(flow)/whatsnew')
    }
    SplashScreen.hideAsync().catch(() => {
        /* reloading the app might make this fail, so ignore */
    })

    const BlurTab = (): JSX.Element => (
        <BlurView
            tint={theme.dark ? 'dark' : 'light'}
            intensity={75}
            style={styles.blurTab}
        />
    )
    const restaurant =
        selectedRestaurants.length !== 1 ? 'food' : selectedRestaurants[0]

    const shortcuts = [
        {
            id: 'timetable',
            type: 'timetable',
            title: t('navigation.timetable'),
            subtitle: t('shortcuts.timetableDescription'),
            symbolName: 'calendar',
            iconName: 'clock',
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
            title: t('cards.titles.' + restaurant),
            data: {
                path: '(tabs)/food',
            },
            symbolName: 'fork.knife',
            iconName: 'silverware_fork_knife',
        },
    ]

    useEffect(() => {
        Shortcuts.setShortcuts(shortcuts)
        const sub = Shortcuts.onShortcutPressed(processShortcut)
        sub.remove()
    }, [selectedRestaurants])

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,

                    tabBarLabelStyle: {
                        marginBottom: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                color={color}
                                ios={{
                                    name: 'house',
                                    variant: 'fill',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'home',
                                    size,
                                }}
                            />
                        ),
                        tabBarStyle: { position: 'absolute' },
                        tabBarBackground: () =>
                            Platform.OS === 'ios' ? <BlurTab /> : null,
                    }}
                />

                <Tabs.Screen
                    name="timetable"
                    options={{
                        headerShown: false,
                        title: t('navigation.timetable'),
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                color={color}
                                ios={{
                                    name: 'clock',
                                    variant: 'fill',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'clock',
                                    size,
                                }}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="map"
                    options={{
                        title: t('navigation.map'),
                        headerShown: false,
                        tabBarHideOnKeyboard: true,
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                color={color}
                                ios={{
                                    name: 'map',
                                    variant: 'fill',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'map',
                                    size,
                                }}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="food"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                color={color}
                                ios={{
                                    name: 'fork.knife',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'silverware-fork-knife',
                                    size,
                                }}
                            />
                        ),
                        tabBarStyle: { position: 'absolute' },
                        tabBarBackground: () =>
                            Platform.OS === 'ios' ? <BlurTab /> : null,
                    }}
                />
            </Tabs>
        </>
    )
}

const styles = StyleSheet.create({
    blurTab: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
})
