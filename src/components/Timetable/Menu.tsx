import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

import PlatformIcon from '../Universal/Icon'

export function MyMenu() {
    const setTimetableNumberDays = usePreferencesStore(
        (state) => state.setTimetableNumberDays
    )
    const timetableNumberDays = usePreferencesStore(
        (state) => state.timetableNumberDays
    )
    const setTimetableMode = usePreferencesStore(
        (state) => state.setTimetableMode
    )
    const timetableMode = usePreferencesStore((state) => state.timetableMode)

    const { t } = useTranslation(['timetable'])
    const { styles } = useStyles(stylesheet)
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Pressable>
                    <PlatformIcon
                        ios={{
                            name: 'calendar',
                            size: 20,
                        }}
                        android={{
                            name: 'calendar_month',
                            size: 20,
                        }}
                        web={{
                            name: 'Calendar',
                            size: 20,
                        }}
                        style={styles.trigger}
                    />
                </Pressable>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Sub>
                    <DropdownMenu.ItemIcon
                        ios={{
                            name: 'checkmark', // required
                        }}
                    ></DropdownMenu.ItemIcon>
                    <DropdownMenu.SubTrigger key="timeline">
                        {t('menu.timeline')}
                    </DropdownMenu.SubTrigger>

                    <DropdownMenu.SubContent>
                        <DropdownMenu.CheckboxItem
                            key="1"
                            value={
                                timetableMode === 'timeline' &&
                                timetableNumberDays === 1
                            }
                            onSelect={() => {
                                setTimetableMode('timeline')
                                setTimetableNumberDays(1)
                            }}
                        >
                            <DropdownMenu.ItemTitle>
                                {t('menu.oneDay')}
                            </DropdownMenu.ItemTitle>
                        </DropdownMenu.CheckboxItem>
                        <DropdownMenu.CheckboxItem
                            key="3"
                            value={
                                timetableMode === 'timeline' &&
                                timetableNumberDays === 3
                            }
                            onSelect={() => {
                                setTimetableMode('timeline')
                                setTimetableNumberDays(3)
                            }}
                        >
                            <DropdownMenu.ItemTitle>
                                {t('menu.threeDays')}
                            </DropdownMenu.ItemTitle>
                        </DropdownMenu.CheckboxItem>
                        <DropdownMenu.CheckboxItem
                            key="5"
                            value={
                                timetableMode === 'timeline' &&
                                timetableNumberDays === 5
                            }
                            onSelect={() => {
                                setTimetableMode('timeline')
                                setTimetableNumberDays(5)
                            }}
                        >
                            <DropdownMenu.ItemTitle>
                                {t('menu.fiveDays')}
                            </DropdownMenu.ItemTitle>
                        </DropdownMenu.CheckboxItem>
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.CheckboxItem
                    key="list"
                    value={timetableMode === 'list'}
                    onSelect={() => {
                        setTimetableMode('list')
                    }}
                >
                    <DropdownMenu.ItemTitle>
                        {t('menu.list')}
                    </DropdownMenu.ItemTitle>
                </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    trigger: {
        color: theme.colors.text,
    },
}))
