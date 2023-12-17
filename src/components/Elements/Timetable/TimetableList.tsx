import { type ITimetableViewProps } from '@/app/(tabs)/timetable'
import { type Colors } from '@/components/colors'
import { type FriendlyTimetableEntry } from '@/types/utils'
import {
    formatFriendlyDate,
    formatFriendlyTime,
    formatISODate,
} from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getGroupedTimetable } from '@/utils/timetable-utils'
import { useTheme } from '@react-navigation/native'
import { useNavigation, useRouter } from 'expo-router'
import React, { useLayoutEffect, useRef } from 'react'
import {
    Dimensions,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

import Divider from '../Universal/Divider'
import HeaderButtons from './HeaderButtons'

export type FlashListItems = FriendlyTimetableEntry | Date | string

export default function TimetableList({
    // eslint-disable-next-line react/prop-types
    friendlyTimetable,
}: ITimetableViewProps): JSX.Element {
    /**
     * Constants
     */
    const today = new Date()
    const timetable = friendlyTimetable

    /**
     * Hooks
     */
    const router = useRouter()
    const theme = useTheme()
    const navigation = useNavigation()
    const listRef = useRef<SectionList<FriendlyTimetableEntry>>(null)

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButtons
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
            <TouchableOpacity
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
                            style={{ color: colors.text, ...styles.titleText }}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        <Text style={{ color: colors.labelColor }}>
                            {item.rooms?.join(', ')}
                        </Text>
                    </View>
                    <View>
                        <Text style={{ color: colors.text }}>
                            {formatFriendlyTime(item.startDate)}
                        </Text>
                        <Text style={{ color: colors.labelColor }}>
                            {formatFriendlyTime(item.endDate)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
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
                ListFooterComponent={
                    <View
                        style={{
                            height: Dimensions.get('window').height - 230,
                        }}
                    />
                }
                initialNumToRender={15}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    sectionView: {
        paddingTop: PAGE_PADDING,
        marginBottom: 8,
        gap: 8,
    },
    sectionTitle: {
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
    },
    sectionFooter: {
        height: 24,
    },
    container: {
        paddingHorizontal: PAGE_PADDING,
    },
    pressable: {
        paddingVertical: 8,
    },
})
