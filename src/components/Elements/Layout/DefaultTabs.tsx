import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { type Theme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet } from 'react-native'

const DefaultTabs = ({ theme }: { theme: Theme }): JSX.Element => {
    const colors = theme.colors as Colors
    const { t } = useTranslation('navigation')
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
                    tabBarStyle: {
                        backgroundColor: colors.card,
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
                    name="(timetable)"
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
                                    name: 'calendar_month',
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
                    name="(food)"
                    options={{
                        title: t('navigation.food'),
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <PlatformIcon
                                color={color}
                                ios={{
                                    name: 'fork.knife',
                                    size: size - 2,
                                }}
                                android={{
                                    name: 'restaurant',
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

export default DefaultTabs
