import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { trackEvent } from '@aptabase/react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

export function HeaderLeft(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const timetableMode = usePreferencesStore((state) => state.timetableMode)
    const setTimetableMode = usePreferencesStore(
        (state) => state.setTimetableMode
    )
    const { t } = useTranslation(['accessibility'])

    return (
        <Pressable
            onPressOut={() => {
                const mode = timetableMode === 'list' ? '3days' : 'list'
                setTimetableMode(mode)
                trackEvent('TimetableMode', {
                    timetableMode: mode,
                })
            }}
            hitSlop={10}
            style={styles.headerButton}
            accessibilityLabel={t('button.timetableMode')}
        >
            <PlatformIcon
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
                style={styles.icon}
            />
        </Pressable>
    )
}

interface HeaderRightProps {
    setToday: () => void
    type: 'week' | 'list'
}

export function HeaderRight({ setToday, type }: HeaderRightProps): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation(['accessibility'])

    const timetableDays = usePreferencesStore((state) => state.timetableDays)
    const setTimetableDays = usePreferencesStore(
        (state) => state.setTimetableDays
    )

    return (
        <View style={styles.container}>
            {type === 'week' && (
                <Pressable
                    onPressOut={() => {
                        const days: number = timetableDays === 5 ? 3 : 5
                        setTimetableDays(days)
                        trackEvent('TimetableDays', {
                            timetableDays: days,
                        })
                    }}
                    style={[styles.headerButton, { marginRight: 10 }]}
                    hitSlop={10}
                    accessibilityLabel={t('button.timetableBack')}
                >
                    <PlatformIcon
                        ios={{
                            name: 'arrow.left.and.right',
                            size: 22,
                        }}
                        android={{
                            name: 'swap_horiz',
                            size: 24,
                        }}
                        style={styles.icon}
                    />
                </Pressable>
            )}

            <Pressable
                onPressOut={setToday}
                style={styles.headerButton}
                hitSlop={10}
                accessibilityLabel={t('button.timetableBack')}
            >
                <PlatformIcon
                    ios={{
                        name: 'arrow.uturn.left',
                        size: 22,
                    }}
                    android={{
                        name: 'keyboard_return',
                        size: 24,
                    }}
                    style={styles.icon}
                />
            </Pressable>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'row',
    },
    headerButton: {
        marginHorizontal: Platform.OS === 'android' ? 14 : 0,
    },
    icon: {
        color: theme.colors.text,
    },
}))
