import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

import DropdownMenuCheckboxItem from '../Menu/DropdownMenuCheckboxItem'
import DropdownMenuContent from '../Menu/DropdownMenuContent'
import DropdownMenuSeparator from '../Menu/DropdownMenuItemSeparator'
import DropdownMenuItemTitle from '../Menu/DropdownMenuItemTitle'
import DropdownMenuSubContent from '../Menu/DropdownMenuSubContent'
import DropdownMenuTrigger from '../Menu/DropdownMenuTrigger'
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

    const { t } = useTranslation('timetable')
    const { styles } = useStyles(stylesheet)
    return (
        <DropdownMenu.Root>
            <DropdownMenuTrigger>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenu.Sub>
                    <DropdownMenu.ItemIcon
                        ios={{
                            name: 'checkmark', // required
                        }}
                    ></DropdownMenu.ItemIcon>
                    <DropdownMenu.SubTrigger key="timeline">
                        {t('menu.timeline')}
                    </DropdownMenu.SubTrigger>

                    <DropdownMenuSubContent>
                        <DropdownMenuCheckboxItem
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
                            <DropdownMenuItemTitle>
                                {t('menu.oneDay')}
                            </DropdownMenuItemTitle>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
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
                            <DropdownMenuItemTitle>
                                {t('menu.threeDays')}
                            </DropdownMenuItemTitle>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
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
                            <DropdownMenuItemTitle>
                                {t('menu.fiveDays')}
                            </DropdownMenuItemTitle>
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuSubContent>
                </DropdownMenu.Sub>

                <DropdownMenuCheckboxItem
                    key="list"
                    value={timetableMode === 'list'}
                    onSelect={() => {
                        setTimetableMode('list')
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.list')}
                    </DropdownMenuItemTitle>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu.Root>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    trigger: {
        color: theme.colors.text,
    },
}))
