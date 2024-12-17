import PlatformIcon from '@/components/Universal/Icon'
import { Tabs } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export function useBottomTabBarHeight(): number {
    return 60
}

const DefaultTabs = (): JSX.Element => {
    const { theme: styleTheme } = useStyles()
    const { t } = useTranslation('navigation')
    const isMobile = Dimensions.get('window').width < 900

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarPosition: isMobile ? 'bottom' : 'left',
                    tabBarActiveBackgroundColor: styleTheme.colors.card,
                    tabBarActiveTintColor: styleTheme.colors.primary,
                    tabBarInactiveTintColor: styleTheme.colors.labelColor,
                    tabBarInactiveBackgroundColor: styleTheme.colors.card,
                    tabBarStyle: {
                        backgroundColor: styleTheme.colors.card,
                    },
                }}
            >
                <Tabs.Screen
                    name="(index)"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                ios={{
                                    name: 'house',
                                    variant: 'fill',
                                    size: size - 4,
                                }}
                                android={{
                                    name: 'home',
                                    size,
                                }}
                                web={{
                                    name: 'House',
                                    size: size - 2,
                                }}
                                style={{
                                    color,
                                }}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="timetable"
                    options={{
                        headerShown: Platform.OS === 'web',
                        title: t('navigation.timetable'),
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                ios={{
                                    name: 'clock',
                                    variant: 'fill',
                                    size: size - 4,
                                }}
                                android={{
                                    name: 'calendar_month',
                                    size,
                                }}
                                web={{
                                    name: 'Clock',
                                    size: size - 2,
                                }}
                                style={{
                                    color,
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
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                ios={{
                                    name: 'map',
                                    variant: 'fill',
                                    size: size - 4,
                                }}
                                android={{
                                    name: 'map',
                                    size,
                                }}
                                web={{
                                    name: 'Map',
                                    size: size - 2,
                                }}
                                style={{
                                    color,
                                }}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="food"
                    options={{
                        title: t('navigation.food'),
                        headerShown: Platform.OS === 'web',
                        tabBarLabel: t('navigation.food'),
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                ios={{
                                    name: 'fork.knife',
                                    size: size - 4,
                                }}
                                android={{
                                    name: 'restaurant',
                                    size,
                                }}
                                web={{
                                    name: 'Utensils',
                                    size: size - 2,
                                }}
                                style={{
                                    color,
                                }}
                            />
                        ),
                    }}
                />
            </Tabs>
        </>
    )
}

export default DefaultTabs
