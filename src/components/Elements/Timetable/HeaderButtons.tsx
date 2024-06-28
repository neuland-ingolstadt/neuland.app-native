import { TimetableContext } from '@/components/contexts'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { Platform, Pressable, StyleSheet } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export function HeaderLeft(): JSX.Element {
    const isDark = useTheme().dark
    const { timetableMode, setTimetableMode } = useContext(TimetableContext)

    return (
        <Pressable
            onPress={() => {
                const mode = timetableMode === 'list' ? '3days' : 'list'
                setTimetableMode(mode)
                trackEvent('TimetableMode', {
                    timetableMode: mode,
                })
            }}
            hitSlop={10}
            style={
                (styles.headerButton,
                { marginRight: Platform.OS === 'ios' ? 0 : 10 })
            }
        >
            <PlatformIcon
                color={isDark ? 'white' : 'black'}
                ios={{
                    name:
                        timetableMode === 'list'
                            ? 'calendar.day.timeline.left'
                            : 'list.bullet',
                    size: 22,
                }}
                android={{
                    name:
                        timetableMode === 'list'
                            ? 'calendar_month'
                            : 'event_note',
                    size: 24,
                }}
            />
        </Pressable>
    )
}

interface HeaderRightProps {
    setToday: () => void
}

export function HeaderRight({ setToday }: HeaderRightProps): JSX.Element {
    const isDark = useTheme().dark
    return (
        <Pressable onPress={setToday} hitSlop={10} style={styles.headerButton}>
            <PlatformIcon
                color={isDark ? 'white' : 'black'}
                ios={{
                    name: 'arrow.uturn.left',
                    size: 22,
                }}
                android={{
                    name: 'keyboard_return',
                    size: 24,
                }}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    headerButton: {
        marginHorizontal: Platform.OS === 'ios' ? 14 : 0,
    },
})
