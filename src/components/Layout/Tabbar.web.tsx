import PlatformIcon from '@/components/Universal/Icon'
import { Tabs } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export function useBottomTabBarHeight(): number {
    return 60
}

const DefaultTabs = (): JSX.Element => {
    const { styles, theme: styleTheme } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: styleTheme.colors.primary,
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

                        tabBarStyle: styles.tabbarStyle(false),
                    }}
                />

                <Tabs.Screen
                    name="timetable"
                    options={{
                        headerShown: false,
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
                        tabBarStyle: styles.tabbarStyle(false),
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
                        tabBarStyle: styles.tabbarStyle(false),
                    }}
                />

                <Tabs.Screen
                    name="food"
                    options={{
                        title: t('navigation.food'),
                        headerShown: false,
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

                        tabBarStyle: styles.tabbarStyle(false),
                    }}
                />
            </Tabs>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    tabbarStyle: (blur: boolean) => ({
        borderTopColor: theme.colors.border,
        backgroundColor: blur
            ? Platform.OS === 'ios'
                ? undefined
                : theme.colors.card
            : theme.colors.card,
        alignItems: 'stretch',
    }),
}))

export default DefaultTabs
