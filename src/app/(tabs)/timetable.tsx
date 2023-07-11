import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'

export default function TimetableScreen(): JSX.Element {
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
        </>
    )
}
