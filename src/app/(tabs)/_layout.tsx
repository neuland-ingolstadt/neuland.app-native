import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

export default function HomeLayout(): JSX.Element {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3a8fb0',
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
                        <Ionicons name="fast-food" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
