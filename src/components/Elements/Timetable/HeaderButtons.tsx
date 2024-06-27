import { ThemeContext, TimetableContext } from '@/components/contexts'
import { getStatusBarIconStyle } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import React, { useContext } from 'react'
import { Pressable, StyleSheet, useColorScheme } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export function HeaderLeft(): JSX.Element {
    const colorScheme = useColorScheme()
    const { theme } = useContext(ThemeContext)
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
            style={styles.headerButton}
        >
            <PlatformIcon
                color={getStatusBarIconStyle(theme, colorScheme)}
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
    const colorScheme = useColorScheme()
    const { theme } = useContext(ThemeContext)

    return (
        <Pressable onPress={setToday} hitSlop={10} style={styles.headerButton}>
            <PlatformIcon
                color={getStatusBarIconStyle(theme, colorScheme)}
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
        marginHorizontal: 14,
    },
})
