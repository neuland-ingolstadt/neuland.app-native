import { Stack } from 'expo-router'
import React from 'react'

export default function TimetableScreen(): JSX.Element {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Timetable',
                }}
            />
        </>
    )
}
