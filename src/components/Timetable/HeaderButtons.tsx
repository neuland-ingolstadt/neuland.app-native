import { PreferencesContext } from '@/components/contexts'
import { trackEvent } from '@aptabase/react-native'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

export function HeaderLeft(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { timetableMode, setTimetableMode } = useContext(PreferencesContext)
    const marginRight = Platform.OS === 'ios' ? 0 : 10
    const { t } = useTranslation(['accessibility'])

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
            style={{ marginRight }}
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
            onPress={setToday}
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
    icon: {
        color: theme.colors.text,
    },
}))
