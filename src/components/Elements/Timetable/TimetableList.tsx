import { type ITimetableViewProps } from '@/app/(tabs)/timetable'
import { type Colors } from '@/components/colors'
import { NotificationContext } from '@/components/provider'
import { type FriendlyTimetableEntry } from '@/types/utils'
import {
    formatFriendlyDate,
    formatFriendlyDateTime,
    formatFriendlyTime,
    formatISODate,
} from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import { useTheme } from '@react-navigation/native'
import { useNavigation, useRouter } from 'expo-router'
import React, { useContext, useLayoutEffect, useRef } from 'react'
import {
    Pressable,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native'

// @ts-expect-error no types
import DragDropView from '../Exclusive/DragView'
import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import { HeaderLeft, HeaderRight } from './HeaderButtons'

export type FlashListItems = FriendlyTimetableEntry | Date | string

export default function TimetableList({
    // eslint-disable-next-line react/prop-types
    friendlyTimetable,
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
    const { timetableNotifications } = useContext(NotificationContext)
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

    /**
     * Constants
     */

    const groupedTimetable = getGroupedTimetable(timetable)
    const filteredTimetable = groupedTimetable.filter(
        (section) => section.title >= today
    )

    /**
     * Functions
     */
    function showEventDetails(entry: FriendlyTimetableEntry): void {
        router.push({
            pathname: '(timetable)/details',
            params: { eventParam: JSON.stringify(entry) },
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

    function renderItem({
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
                        <View
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
                            <View
                                style={{
                                    flexDirection: 'row',
                                    gap: 4,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.labelColor,
                                        ...styles.descriptionText,
                                    }}
                                >
                                    {item.rooms?.join(', ')}
                                </Text>
                                {timetableNotifications[item.shortName] !==
                                    undefined && (
                                    <PlatformIcon
                                        color={colors.labelColor}
                                        ios={{
                                            name: 'bell',
                                            size: 12,
                                        }}
                                        android={{
                                            name: 'bell',
                                            size: 14,
                                        }}
                                    />
                                )}
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

    return (
        <SafeAreaView style={styles.pageView}>
            <SectionList
                ref={listRef}
                sections={filteredTimetable}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) =>
                    renderSectionHeader(title)
                }
                renderSectionFooter={renderSectionFooter}
                ItemSeparatorComponent={renderItemSeparator}
                contentContainerStyle={styles.container}
                stickySectionHeadersEnabled={true}
                initialNumToRender={20}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
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
    },
    pressable: {
        paddingVertical: 8,
    },
})
