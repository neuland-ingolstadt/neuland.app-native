import { TimetableMode, usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useTranslation } from 'react-i18next'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

import DropdownMenuContent from '../Menu/DropdownMenuContent'
import DropdownMenuSeparator from '../Menu/DropdownMenuItemSeparator'
import DropdownMenuItemTitle from '../Menu/DropdownMenuItemTitle'
import DropdownMenuTrigger from '../Menu/DropdownMenuTrigger'
import PlatformIcon from '../Universal/Icon'

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
                <PlatformIcon
                    ios={{
                        name: 'calendar.day.timeline.left',
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
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenu.CheckboxItem
                    key="1"
                    value={timetableMode === TimetableMode.Timeline1}
                    onValueChange={() => {
                        setTimetableMode(TimetableMode.Timeline1)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.oneDay')}
                    </DropdownMenuItemTitle>
                    <DropdownMenu.ItemIcon
                        ios={{
                            name: '1.circle',
                        }}
                    />
                </DropdownMenu.CheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenu.CheckboxItem
                    key="3"
                    value={timetableMode === TimetableMode.Timeline3}
                    onValueChange={() => {
                        setTimetableMode(TimetableMode.Timeline3)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.threeDays')}
                    </DropdownMenuItemTitle>
                    <DropdownMenu.ItemIcon
                        ios={{
                            name: '3.circle',
                        }}
                    />
                </DropdownMenu.CheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenu.CheckboxItem
                    key="5"
                    value={timetableMode === TimetableMode.Timeline5}
                    onValueChange={() => {
                        setTimetableMode(TimetableMode.Timeline5)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.fiveDays')}
                    </DropdownMenuItemTitle>
                    <DropdownMenu.ItemIcon
                        ios={{
                            name: '5.circle',
                        }}
                    />
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem
                    key="list"
                    value={timetableMode === TimetableMode.List}
                    onValueChange={() => {
                        setTimetableMode(TimetableMode.List)
                    }}
                >
                    <DropdownMenuItemTitle>
                        {t('menu.list')}
                    </DropdownMenuItemTitle>
                    <DropdownMenu.ItemIcon
                        ios={{
                            name: 'list.dash',
                        }}
                    />
                </DropdownMenu.CheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu.Root>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    trigger: {
        color: theme.colors.text,
    },
}))
