import ErrorView from '@/components/Error/ErrorView'
// @ts-expect-error no types
import DragDropView from '@/components/Exclusive/DragView'
import Divider from '@/components/Universal/Divider'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type ITimetableViewProps } from '@/types/timetable'
import { type Exam, type FriendlyTimetableEntry } from '@/types/utils'
import {
    formatFriendlyDate,
    formatFriendlyDateTime,
    formatFriendlyTime,
    formatISODate,
} from '@/utils/date-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import { inverseColor } from '@/utils/ui-utils'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRouter } from 'expo-router'
import React, { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, SectionList, Text, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

import { HeaderLeft, HeaderRight } from './HeaderButtons'

export type FlashListItems = FriendlyTimetableEntry | Date | string

export default function TimetableList({
    // eslint-disable-next-line react/prop-types
    timetable,
    // eslint-disable-next-line react/prop-types
    exams,
}: ITimetableViewProps): JSX.Element {
    /**
     * Constants
     */
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    /**
     * Hooks
     */
    const router = useRouter()
    const navigation = useNavigation()
    const listRef = useRef<SectionList<FriendlyTimetableEntry>>(null)
    const { t } = useTranslation('timetable')
    const { styles, theme } = useStyles(stylesheet)
    const setSelectedLecture = useRouteParamsStore(
        (state) => state.setSelectedLecture
    )
    const setSelectedExam = useRouteParamsStore(
        (state) => state.setSelectedExam
    )

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderRight
                    setToday={() => {
                        listRef.current?.scrollToLocation({
                            sectionIndex: 0,
                            itemIndex: 0,
                            viewOffset: 0,
                            viewPosition: 0,
                        })
                    }}
                    type="list"
                />
            ),
            headerLeft: () => <HeaderLeft />,
        })
    }, [navigation])

    /**
     * Colors
     */

    /**
     * Constants
     */

    const groupedTimetable = getGroupedTimetable(timetable, exams)
    const filteredTimetable = groupedTimetable.filter(
        (section) => section.title >= today
    )
    const isDark = UnistylesRuntime.themeName === 'dark'
    function getLineColor(color: string): string {
        return Color(color)
            .darken(isDark ? 0.2 : 0)
            .lighten(isDark ? 0 : 0.2)
            .hex()
    }

    /**
     * Functions
     */
    function showEventDetails(entry: FriendlyTimetableEntry): void {
        setSelectedLecture(entry)
        router.navigate('/lecture')
    }

    function renderSectionHeader(title: Date): JSX.Element {
        const isToday = formatISODate(title) === formatISODate(today)

        return (
            <View style={styles.sectionView}>
                <Text style={styles.sectionTitle(isToday)}>
                    {formatFriendlyDate(title, { weekday: 'long' })}
                </Text>
                <Divider iosPaddingLeft={16} width={'100%'} />
            </View>
        )
    }

    function renderSectionFooter(): JSX.Element {
        return <View style={styles.sectionFooter} />
    }

    function renderItemSeparator(): JSX.Element {
        return <Divider color={theme.colors.border} iosPaddingLeft={16} />
    }
    function renderTimetableItem({
        item,
    }: {
        item: FriendlyTimetableEntry
    }): JSX.Element {
        return (
            <DragDropView
                mode="drag"
                scope="system"
                dragValue={`${item.name} in ${item.rooms?.join(
                    ', '
                )} (${formatFriendlyDateTime(
                    item.startDate
                )} - ${formatFriendlyTime(item.endDate)})`}
            >
                <Pressable
                    onPress={() => {
                        showEventDetails(item)
                    }}
                    style={styles.pressable}
                >
                    <View style={styles.eventWrapper}>
                        <LinearGradient
                            colors={[
                                theme.colors.primary,
                                getLineColor(theme.colors.primary),
                            ]}
                            start={[0, 0.9]}
                            end={[0.7, 0.25]}
                            style={{
                                ...styles.indicator,
                            }}
                        />
                        <View style={styles.nameView}>
                            <Text style={styles.titleText} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={styles.itemRow}>
                                <Text style={styles.descriptionText}>
                                    {item.rooms?.join(', ')}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.time}>
                                {formatFriendlyTime(item.startDate)}
                            </Text>
                            <Text style={styles.time2}>
                                {formatFriendlyTime(item.endDate)}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </DragDropView>
        )
    }
    function renderExamItem({ exam }: { exam: Exam }): JSX.Element {
        const navigateToPage = (): void => {
            setSelectedExam(exam)
            router.navigate('/exam')
        }
        return (
            <DragDropView
                mode="drag"
                scope="system"
                dragValue={`${exam.name} in ${exam.rooms} (${formatFriendlyDateTime(exam.date)})`}
            >
                <Pressable
                    onPress={() => {
                        navigateToPage()
                    }}
                    style={styles.pressable}
                >
                    <View style={styles.eventWrapper}>
                        <LinearGradient
                            colors={[
                                inverseColor(theme.colors.primary),
                                getLineColor(
                                    inverseColor(theme.colors.primary)
                                ),
                            ]}
                            start={[0, 0.9]}
                            end={[0.7, 0.25]}
                            style={styles.indicator}
                        />
                        <View style={styles.nameView}>
                            <Text style={styles.titleText} numberOfLines={2}>
                                {t('cards.calendar.exam', {
                                    ns: 'navigation',
                                    name: exam.name,
                                })}
                            </Text>
                            <View style={styles.itemRow}>
                                <Text style={styles.descriptionText}>
                                    {exam.seat ?? exam.rooms}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.time}>
                                {formatFriendlyTime(exam.date)}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </DragDropView>
        )
    }

    function renderItem({ item }: { item: any }): JSX.Element {
        if (item.eventType === 'exam') {
            return renderExamItem({ exam: item })
        }
        return renderTimetableItem({ item })
    }

    return (
        <>
            {filteredTimetable.length === 0 ? (
                <ErrorView
                    title={t('error.filtered.title')}
                    message={t('error.filtered.message')}
                    icon={{
                        ios: 'fireworks',
                        android: 'celebration',
                    }}
                    isCritical={false}
                />
            ) : (
                <SectionList
                    ref={listRef}
                    sections={filteredTimetable}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => {
                        if (!(title instanceof Date)) {
                            console.error('Invalid section title')
                            return null
                        }
                        return renderSectionHeader(title)
                    }}
                    renderSectionFooter={renderSectionFooter}
                    ItemSeparatorComponent={renderItemSeparator}
                    contentContainerStyle={styles.container}
                    stickySectionHeadersEnabled={true}
                    initialNumToRender={20}
                />
            )}
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        paddingBottom: 80,
        paddingHorizontal: theme.margins.page,
    },
    descriptionText: {
        color: theme.colors.labelColor,
        fontSize: 15,
    },
    eventWrapper: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
    },
    indicator: {
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
        height: '100%',
        width: 4,
    },

    itemRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    nameView: {
        flexGrow: 1,
        flexShrink: 1,
        marginRight: 12,
    },
    pressable: {
        paddingVertical: 8,
    },
    sectionFooter: {
        height: 20,
    },
    sectionTitle: (isToday: boolean) => ({
        fontSize: 15,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: isToday ? theme.colors.primary : theme.colors.text,
    }),
    sectionView: {
        backgroundColor: theme.colors.background,
        gap: 6,
        marginBottom: 8,
        paddingTop: theme.margins.page,
    },
    time: {
        color: theme.colors.text,
        fontSize: 15,
        fontVariant: ['tabular-nums'],
    },
    time2: {
        color: theme.colors.labelColor,
        fontSize: 15,
        fontVariant: ['tabular-nums'],
    },
    titleText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
}))
