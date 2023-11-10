import changelog from '@/data/changelog.json'
import { type Colors } from '@/stores/colors'
import { FlowContext } from '@/stores/provider'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { Ionicons } from '@expo/vector-icons'
import { type Theme, useTheme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import { Tabs, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet } from 'react-native'

import packageInfo from '../../../package.json'

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const router = useRouter()
    const colors = theme.colors as Colors
    const flow = React.useContext(FlowContext)
    const { t } = useTranslation('navigation')

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
                            <Ionicons name="home" size={size} color={color} />
                        ),
                        tabBarStyle: { position: 'absolute' },
                        tabBarBackground: () =>
                            Platform.OS === 'ios' ? <BlurTab /> : null,
                    }}
                />

                <Tabs.Screen
                    name="timetable"
                    options={{
                        title: t('navigation.timetable'),
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="time" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="map"
                    options={{
                        title: t('navigation.map'),
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="map" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="food"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="restaurant-sharp"
                                size={size}
                                color={color}
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
