import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Theme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

const DefaultTabs = ({ theme }: { theme: Theme }): JSX.Element => {
    const { styles, theme: styleTheme } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')
    const BlurTab = (): JSX.Element => (
        <BlurView
            tint={UnistylesRuntime.themeName === 'dark' ? 'dark' : 'light'}
            intensity={75}
            style={styles.blurTab}
        />
    )

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: styleTheme.colors.primary,
                    tabBarLabelStyle: {
                        marginBottom: 2,
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
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'home',
                                    size,
                                }}
                                style={{
                                    color,
                                }}
                            />
                        ),

                        tabBarStyle: styles.tabbarStyle(true),
                        tabBarBackground: () =>
                            Platform.OS === 'ios' ? <BlurTab /> : null,
                    }}
                />

                <Tabs.Screen
                    name="(timetable)"
                    options={{
                        headerShown: false,
                        title: t('navigation.timetable'),
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                ios={{
                                    name: 'clock',
                                    variant: 'fill',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'calendar_month',
                                    size,
                                }}
                                style={{
                                    color,
                                }}
                            />
                        ),
                        tabBarStyle: styles.tabbarStyle(true),
                        tabBarBackground: () =>
                            Platform.OS === 'ios' ? <BlurTab /> : null,
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
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'map',
                                    size,
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
                    name="(food)"
                    options={{
                        title: t('navigation.food'),
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                ios={{
                                    name: 'fork.knife',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'restaurant',
                                    size,
                                }}
                                style={{
                                    color,
                                }}
                            />
                        ),

                        tabBarStyle: styles.tabbarStyle(true),
                        tabBarBackground: () =>
                            Platform.OS === 'ios' ? <BlurTab /> : null,
                    }}
                />
            </Tabs>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    blurTab: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    tabbarStyle: (blur: boolean) => ({
        position: 'absolute',
        borderTopColor: theme.colors.border,
        backgroundColor: blur
            ? Platform.OS === 'ios'
                ? undefined
                : theme.colors.card
            : theme.colors.card,
    }),
}))

export default DefaultTabs
