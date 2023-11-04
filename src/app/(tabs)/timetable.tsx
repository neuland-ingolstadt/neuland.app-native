import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

export default function TimetableScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['navigation'])
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
                    title: t('navigation.timetable'),
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
