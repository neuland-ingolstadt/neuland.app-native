import { type Colors } from '@/components/colors'
import { TimetableContext } from '@/components/provider'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { TouchableOpacity } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export function HeaderLeft(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { timetableMode, setTimetableMode } = useContext(TimetableContext)

    return (
        <TouchableOpacity
            onPress={() => {
                setTimetableMode(timetableMode === 'list' ? '3days' : 'list')
            }}
            hitSlop={10}
        >
            <PlatformIcon
                color={colors.text}
                ios={{
                    name:
                        timetableMode === 'list'
                            ? 'calendar.day.timeline.left'
                            : 'list.bullet',
                    size: 22,
                }}
                android={{
                    name: timetableMode === 'list' ? 'calendar-month' : 'list',
                    size: 24,
                }}
            />
        </TouchableOpacity>
    )
}

interface HeaderRightProps {
    setToday: () => void
}

export function HeaderRight({ setToday }: HeaderRightProps): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <TouchableOpacity onPress={setToday} hitSlop={10}>
            <PlatformIcon
                color={colors.text}
                ios={{
                    name: 'arrow.uturn.left',
                    size: 22,
                }}
                android={{
                    name: 'return',
                    size: 24,
                }}
            />
        </TouchableOpacity>
    )
}
