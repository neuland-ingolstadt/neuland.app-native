import { TimetableMode, usePreferencesStore } from '@/hooks/usePreferencesStore'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

import DropdownMenuContent from '../Menu/DropdownMenuContent'
import DropdownMenuItem from '../Menu/DropdownMenuItem'
import DropdownMenuSeparator from '../Menu/DropdownMenuItemSeparator'
import DropdownMenuItemTitle from '../Menu/DropdownMenuItemTitle'
import DropdownMenuTrigger from '../Menu/DropdownMenuTrigger'
import PlatformIcon from '../Universal/Icon'

const CheckMarkIcon = () => {
    return (
        <DropdownMenu.ItemIcon
            ios={{
                name: 'checkmark', // required
            }}
            androidIconName="check"
        />
    )
}
export function MyMenu() {
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
                <DropdownMenuItem
                    key="1"
                    onSelect={() => {
                        setTimetableMode(TimetableMode.Timeline1)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.oneDay')}
                    </DropdownMenuItemTitle>
                    {timetableMode === TimetableMode.Timeline1 && (
                        <CheckMarkIcon />
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    key="3"
                    onSelect={() => {
                        setTimetableMode(TimetableMode.Timeline3)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.threeDays')}
                    </DropdownMenuItemTitle>
                    {timetableMode === TimetableMode.Timeline3 && (
                        <CheckMarkIcon />
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    key="5"
                    onSelect={() => {
                        setTimetableMode(TimetableMode.Timeline5)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.fiveDays')}
                    </DropdownMenuItemTitle>
                    {timetableMode === TimetableMode.Timeline5 && (
                        <CheckMarkIcon />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    key="list"
                    onSelect={() => {
                        setTimetableMode(TimetableMode.List)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.list')}
                    </DropdownMenuItemTitle>
                    {timetableMode === TimetableMode.List && <CheckMarkIcon />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu.Root>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    trigger: {
        color: theme.colors.text,
    },
}))
