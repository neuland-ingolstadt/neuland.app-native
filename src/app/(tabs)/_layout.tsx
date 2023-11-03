import changelog from '@/assets/data/changelog.json'
import { type Colors } from '@/stores/colors'
import { FlowContext } from '@/stores/provider'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { Ionicons } from '@expo/vector-icons'
import { type Theme, useTheme } from '@react-navigation/native'
import { Tabs, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { TouchableOpacity } from 'react-native'

import packageInfo from '../../../package.json'

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const router = useRouter()
    const colors = theme.colors as Colors
    const flow = React.useContext(FlowContext)

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
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,

                    tabBarLabelStyle: {
                        marginBottom: 2,
                    },
                    lazy: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="timetable"
                    options={{
                        title: 'Timetable',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="time" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="map"
                    options={{
                        title: 'Map',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="map" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="food"
                    options={{
                        title: 'Food',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="restaurant-sharp"
                                size={size}
                                color={color}
                            />
                        ),
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={() => {
                                    router.push('(food)/preferences')
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    padding: 10,
                                }}
                            >
                                <Ionicons
                                    name="filter"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Tabs>
        </>
    )
}
