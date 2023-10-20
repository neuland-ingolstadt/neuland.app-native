import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import Head from 'expo-router/head'
import React from 'react'
import { View } from 'react-native'
import WeekView from 'react-native-week-view'
import { type WeekViewEvent } from 'react-native-week-view'

export default function TimetableScreen(): JSX.Element {
    function getMonday(): Date {
        const d = new Date()
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
        return new Date(d.setDate(diff))
    }

    function demoDate(date: Date): Date {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours() + 1,
            date.getMinutes(),
            date.getSeconds()
        )
    }

    function getTomorrow(): Date {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        d.setHours(15)

        return d
    }

    const myEvents: WeekViewEvent[] = [
        {
            id: 1,
            startDate: new Date(),
            endDate: demoDate(new Date()),
            color: 'blue',
            description: 'E1',
            eventKind: 'block',
            resolveOverlap: 'stack',
            stackKey: '1',
            // ... more properties if needed,
        },
        {
            id: 2,
            startDate: getTomorrow(),
            endDate: demoDate(getTomorrow()),
            color: 'red',
            description: 'E2',
            disableDrag: true,
            eventKind: 'block',
            stackKey: '2',
            resolveOverlap: 'stack',
        },
    ]

    const colors = useTheme().colors as Colors

    return (
        <>
            <Head>
                <title>Timetable</title>
                <meta name="Timetable" content="Personal Timetable" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>

            <View
                style={{
                    height: '100%',
                }}
            >
                <WeekView
                    events={myEvents}
                    selectedDate={getMonday()}
                    numberOfDays={7}
                    beginAgendaAt={8 * 60}
                    startHour={9}
                    endAgendaAt={21 * 60}
                    hoursInDisplay={10}
                    showNowLine={true}
                    eventContainerStyle={{
                        borderRadius: 4,
                        elevation: 1,
                    }}
                    headerStyle={{
                        borderBottomWidth: 0,
                        borderRightWidth: 0,
                        borderWidth: 0,
                    }}
                    gridRowStyle={{
                        borderWidth: 0,
                    }}
                    hourTextStyle={{
                        color: colors.text,
                        marginTop: 10,
                        // paddingTop: 5,
                        // borderTopColor: colors.border,
                        // borderTopWidth: 1,
                    }}
                    gridColumnStyle={{
                        borderWidth: 0,
                        borderRightWidth: 0,
                    }}
                    headerTextStyle={{
                        color: colors.text,
                        borderRightWidth: 0,
                    }}
                />
            </View>
        </>
    )
}
