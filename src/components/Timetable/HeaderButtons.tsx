import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { trackEvent } from '@aptabase/react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
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
}

export function HeaderRight({ setToday }: HeaderRightProps): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation(['accessibility'])
    return (
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
    )
}

const stylesheet = createStyleSheet((theme) => ({
    headerButton: {
        marginHorizontal: 12,
    },
    icon: {
        color: theme.colors.text,
    },
}))
