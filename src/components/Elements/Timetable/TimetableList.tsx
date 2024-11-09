import { type ITimetableViewProps } from '@/app/(tabs)/(timetable)/timetable'
import { type Colors } from '@/components/colors'
import { type Exam, type FriendlyTimetableEntry } from '@/types/utils'
import {
    formatFriendlyDate,
    formatFriendlyDateTime,
    formatFriendlyTime,
    formatISODate,
} from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import { inverseColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { Buffer } from 'buffer/'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRouter } from 'expo-router'
import React, { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Pressable,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native'

import ErrorView from '../Error/ErrorView'
// @ts-expect-error no types
import DragDropView from '../Exclusive/DragView'
import Divider from '../Universal/Divider'
import { HeaderLeft, HeaderRight } from './HeaderButtons'

export type FlashListItems = FriendlyTimetableEntry | Date | string

export default function TimetableList({
    // eslint-disable-next-line react/prop-types
    friendlyTimetable,
    // eslint-disable-next-line react/prop-types
    exams,
}: ITimetableViewProps): JSX.Element {
    /**
     * Constants
     */
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const timetable = friendlyTimetable

    /**
     * Hooks
     */
    const router = useRouter()
    const theme = useTheme()
    const navigation = useNavigation()
    const listRef = useRef<SectionList<FriendlyTimetableEntry>>(null)
    const { t } = useTranslation('timetable')

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
                />
            ),
            headerLeft: () => <HeaderLeft />,
        })
    }, [navigation])

    /**
     * Colors
     */
    const colors = theme.colors as Colors
    const primaryColor = colors.primary
    const inversePrimary = inverseColor(primaryColor)

    /**
     * Constants
     */

    const groupedTimetable = getGroupedTimetable(timetable, exams)
    const filteredTimetable = groupedTimetable.filter(
        (section) => section.title >= today
    )
    const isDark = theme.dark
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
        const base64Event = Buffer.from(JSON.stringify(entry)).toString(
            'base64'
        )

        router.navigate({
            pathname: 'lecture',
            params: { lecture: base64Event },
        })
    }

    function renderSectionHeader(title: Date): JSX.Element {
        const isToday = formatISODate(title) === formatISODate(today)

        return (
            <View
                style={{
                    backgroundColor: colors.background,
                    ...styles.sectionView,
                }}
            >
                <Text
                    style={{
                        ...styles.sectionTitle,
                        color: isToday ? colors.primary : colors.text,
                    }}
                >
                    {formatFriendlyDate(title, { weekday: 'long' })}
                </Text>
                <Divider
                    color={colors.labelTertiaryColor}
                    iosPaddingLeft={16}
                    width={'100%'}
                />
            </View>
        )
    }

    function renderSectionFooter(): JSX.Element {
        return <View style={styles.sectionFooter} />
    }

    function renderItemSeparator(): JSX.Element {
        return <Divider color={colors.border} iosPaddingLeft={16} />
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
                                colors.primary,
                                getLineColor(colors.primary),
                            ]}
                            start={[0, 0.9]}
                            end={[0.7, 0.25]}
                            style={{
                                backgroundColor: colors.primary,
                                ...styles.indicator,
                            }}
                        />
                        <View style={styles.nameView}>
                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.titleText,
                                }}
                                numberOfLines={1}
                            >
                                {item.name}
                            </Text>
                            <View style={styles.itemRow}>
                                <Text
                                    style={{
                                        color: colors.labelColor,
                                        ...styles.descriptionText,
                                    }}
                                >
                                    {item.rooms?.join(', ')}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text
                                style={{
                                    color: colors.text,
                                    fontVariant: ['tabular-nums'],
                                    ...styles.descriptionText,
                                }}
                            >
                                {formatFriendlyTime(item.startDate)}
                            </Text>
                            <Text
                                style={{
                                    color: colors.labelColor,
                                    fontVariant: ['tabular-nums'],
                                    ...styles.descriptionText,
                                }}
                            >
                                {formatFriendlyTime(item.endDate)}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </DragDropView>
        )
    }
    function renderExamItem({ exam }: { exam: Exam }): JSX.Element {
        const base64Event = Buffer.from(JSON.stringify(exam)).toString('base64')
        const navigateToPage = (): void => {
            router.push({
                pathname: 'exam',
                params: { examEntry: base64Event },
            })
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
                                inversePrimary,
                                getLineColor(inversePrimary),
                            ]}
                            start={[0, 0.9]}
                            end={[0.7, 0.25]}
                            style={{
                                backgroundColor: inversePrimary,
                                ...styles.indicator,
                            }}
                        />
                        <View style={styles.nameView}>
                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.titleText,
                                }}
                                numberOfLines={2}
                            >
                                {t('cards.calendar.exam', {
                                    ns: 'navigation',
                                    name: exam.name,
                                })}
                            </Text>
                            <View style={styles.itemRow}>
                                <Text
                                    style={{
                                        color: colors.labelColor,
                                        ...styles.descriptionText,
                                    }}
                                >
                                    {exam.seat ?? exam.rooms}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text
                                style={{
                                    color: colors.text,
                                    fontVariant: ['tabular-nums'],
                                    ...styles.descriptionText,
                                }}
                            >
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
        <SafeAreaView style={styles.pageView}>
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
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    itemRow: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    sectionView: {
        paddingTop: PAGE_PADDING,
        marginBottom: 8,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    pageView: {
        flex: 1,
    },
    eventWrapper: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
    },
    indicator: {
        width: 4,
        borderRadius: 2,
        height: '100%',
    },
    nameView: {
        flexGrow: 1,
        flexShrink: 1,
        marginRight: 12,
    },
    titleText: {
        fontWeight: '500',
        fontSize: 16,
    },
    descriptionText: {
        fontSize: 15,
    },
    sectionFooter: {
        height: 20,
    },
    container: {
        paddingHorizontal: PAGE_PADDING,
        paddingBottom: 80,
    },
    pressable: {
        paddingVertical: 8,
    },
})
