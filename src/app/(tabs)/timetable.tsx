import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { Text } from 'react-native'

export default function TimetableScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    return (
        <>
            <Head>
                <title>Timetable</title>
                <meta name="Timetable" content="Personal Timetable" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <Stack.Screen
                options={{
                    title: 'Timetable',
                }}
            />
            <Text
                style={{
                    fontSize: 15,
                    alignSelf: 'center',
                    padding: 10,
                    color: colors.text,
                }}
            >
                coming soon
            </Text>
        </>
    )
}
