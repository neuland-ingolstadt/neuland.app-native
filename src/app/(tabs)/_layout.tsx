import { type Colors } from '@/components/provider'
import { Ionicons } from '@expo/vector-icons'
import { type Theme, useTheme } from '@react-navigation/native'
import { Tabs } from 'expo-router'
import React from 'react'

export default function HomeLayout(): JSX.Element {
    const theme: Theme = useTheme()
    const colors = theme.colors as Colors

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,
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
                                name="fast-food"
                                size={size}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </>
    )
}
