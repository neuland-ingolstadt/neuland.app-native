import { type Colors } from '@/components/colors'
import { TimetableContext } from '@/components/provider'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

interface HeaderButtonsProps {
    setToday: () => void
}

export default function HeaderButtons({
    setToday,
}: HeaderButtonsProps): JSX.Element {
    const colors = useTheme().colors as Colors
    const { timetableMode, setTimetableMode } = useContext(TimetableContext)

    return (
        <View style={styles.view}>
            <TouchableOpacity
                onPress={() => {
                    setTimetableMode(
                        timetableMode === 'list' ? '3days' : 'list'
                    )
                }}
                hitSlop={10}
            >
                <PlatformIcon
                    color={colors.text}
                    ios={{
                        name:
                            timetableMode === 'list'
                                ? 'calendar'
                                : 'list.bullet',
                        size: 22,
                    }}
                    android={{
                        name:
                            timetableMode === 'list'
                                ? 'calendar-month'
                                : 'list',
                        size: 24,
                    }}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={setToday} hitSlop={10}>
                <PlatformIcon
                    color={colors.text}
                    ios={{
                        name: 'arrow.uturn.left',
                        size: 22,
                    }}
                    android={{
                        name: 'calendar',
                        size: 24,
                    }}
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        gap: 12,
        flexDirection: 'row',
    },
})
