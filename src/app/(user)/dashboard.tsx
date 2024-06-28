import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Card, type ExtendedCard, cardIcons } from '@/components/allCards'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { getDefaultDashboardOrder } from '@/hooks/contexts/dashboard'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { type MaterialIcon } from '@/types/material-icons'
import { arraysEqual } from '@/utils/app-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { showToast } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'
import { ScrollView } from 'react-native-gesture-handler'
import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'

const { width } = Dimensions.get('window')

export default function DashboardEdit(): JSX.Element {
    const childrenHeight = 48

    const {
        shownDashboardEntries,
        hiddenDashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
    } = useContext(DashboardContext)
    const isDark = useTheme().dark
    const { userKind } = useContext(UserKindContext)
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['settings'])
    const [draggedKey, setDraggedKey] = useState<string | null>(null)

    const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)
    const [defaultHiddenKeys, setDefaultHiddenKeys] = useState<string[]>([])
    const [filteredHiddenDashboardEntries, setFilteredHiddenDashboardEntries] =
        useState<Card[]>([])

    // add translation to shownDashboardEntries with new key transText
    const transShownDashboardEntries = shownDashboardEntries?.map((item) => {
        return {
            ...item,
            // @ts-expect-error cannot verify the type
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            text: t('cards.titles.' + item.key, {
                ns: 'navigation',
            }) as string,
        }
    })

    const newHoveredKeyShared = useSharedValue(-1)

    // Define a worklet function

    // Modification in updateHoveredKeyWorklet
    const updateHoveredKeyWorklet = (newKey: number): void => {
        'worklet'
        if (newHoveredKeyShared.value !== newKey) {
            if (Platform.OS === 'ios' && newHoveredKeyShared.value !== -1) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
            }
            newHoveredKeyShared.value = newKey
        }
    }

    useEffect(() => {
        setFilteredHiddenDashboardEntries(
            hiddenDashboardEntries?.filter(
                (item) =>
                    item?.exclusive !== true || item.default.includes(userKind)
            )
        )
    }, [hiddenDashboardEntries, userKind])

    const renderItem = (params: ExtendedCard): JSX.Element => {
        const onPressDelete = (): void => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            hideDashboardEntry(params.key)
        }
        // To call this worklet from React (e.g., in an event handler or useEffect)

        const isLast =
            shownDashboardEntries?.[shownDashboardEntries.length - 1].key ===
            params.key

        return (
            <RowItem
                item={params}
                onPressDelete={onPressDelete}
                isLast={isLast}
                isDragged={draggedKey === params.key}
            />
        )
    }

    const handleRestore = useCallback(
        (item: Card) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            bringBackDashboardEntry(item.key)
        },
        [bringBackDashboardEntry]
    )

    const handleReset = useCallback(() => {
        resetOrder(userKind)
        if (Platform.OS === 'ios') {
            void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            )
        }
    }, [resetOrder])

    useEffect(() => {
        const defaultHidden = getDefaultDashboardOrder(userKind).hidden.map(
            (item) => item.key
        )
        const defaultShown =
            getDefaultDashboardOrder(userKind).shown?.map((item) => item.key) ??
            []

        if (shownDashboardEntries == null) {
            return
        }
        setHasUserDefaultOrder(
            arraysEqual(
                defaultHidden,
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                hiddenDashboardEntries
                    ?.filter(Boolean)
                    .map((item) => item.key) || []
            ) &&
                arraysEqual(
                    defaultShown,
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    shownDashboardEntries
                        ?.filter(Boolean)
                        .map((item) => item.key) || []
                )
        )

        setDefaultHiddenKeys(defaultHidden)
    }, [shownDashboardEntries, hiddenDashboardEntries, userKind])

    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.page}
                bounces={false}
                contentInsetAdjustmentBehavior="automatic"
            >
                <View style={styles.wrapper}>
                    {userKind === USER_GUEST && (
                        <Pressable
                            style={[
                                styles.card,
                                styles.noteContainer,
                                { backgroundColor: colors.card },
                            ]}
                            onPress={() => {
                                router.navigate('login')
                            }}
                        >
                            <View style={styles.noteTextContainer}>
                                <PlatformIcon
                                    color={colors.primary}
                                    ios={{
                                        name: 'lock',
                                        size: 20,
                                    }}
                                    android={{
                                        name: 'lock',
                                        size: 24,
                                    }}
                                />
                                <Text
                                    style={{
                                        color: colors.primary,
                                        ...styles.notesTitle,
                                    }}
                                >
                                    {t('dashboard.unavailable.title')}
                                </Text>
                            </View>

                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.notesMessage,
                                }}
                            >
                                {t('dashboard.unavailable.message')}
                            </Text>
                        </Pressable>
                    )}
                    <View style={styles.block}>
                        <Text
                            style={[
                                styles.sectionHeaderText,
                                { color: colors.labelSecondaryColor },
                            ]}
                        >
                            {t('dashboard.shown')}
                        </Text>
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.background,
                                },
                            ]}
                        >
                            {shownDashboardEntries?.length === 0 ? (
                                <View
                                    style={{
                                        height: childrenHeight * 1.5,
                                        backgroundColor: colors.card,

                                        ...styles.emptyContainer,
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.textEmpty,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {t('dashboard.noShown')}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.outer}>
                                    <DragSortableView
                                        keyExtractor={(item) => item.key}
                                        dataSource={
                                            transShownDashboardEntries ?? []
                                        }
                                        childrenWidth={width}
                                        childrenHeight={childrenHeight}
                                        parentWidth={width}
                                        renderItem={renderItem}
                                        onDataChange={(data: Card[]) => {
                                            updateDashboardOrder(data)
                                        }}
                                        onClickItem={() => {
                                            void showToast(
                                                t('toast.dashboard', {
                                                    ns: 'common',
                                                })
                                            )
                                        }}
                                        onDragging={(
                                            _gestureState: any,
                                            _left: number,
                                            _top: number,
                                            moveToIndex: number
                                        ) => {
                                            runOnUI(updateHoveredKeyWorklet)(
                                                moveToIndex
                                            )
                                        }}
                                        onDragStart={(index: number) => {
                                            setDraggedKey(
                                                transShownDashboardEntries?.[
                                                    index
                                                ].key ?? null
                                            )
                                            if (Platform.OS === 'ios') {
                                                void Haptics.impactAsync(
                                                    Haptics.ImpactFeedbackStyle
                                                        .Rigid
                                                )
                                            }
                                        }}
                                        onDragEnd={() => {
                                            setDraggedKey(null)
                                            if (Platform.OS === 'ios') {
                                                void Haptics.impactAsync(
                                                    Haptics.ImpactFeedbackStyle
                                                        .Soft
                                                )
                                            }
                                        }}
                                        maxScale={1.05}
                                        delayLongPress={100}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.block}>
                        {filteredHiddenDashboardEntries.filter(Boolean).length >
                            0 && (
                            <Text
                                style={[
                                    styles.sectionHeaderText,
                                    { color: colors.labelSecondaryColor },
                                ]}
                            >
                                {t('dashboard.hidden')}
                            </Text>
                        )}
                        <View style={styles.card}>
                            {filteredHiddenDashboardEntries
                                .filter(Boolean)
                                .map((item, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <Pressable
                                                disabled={defaultHiddenKeys.includes(
                                                    item.key
                                                )}
                                                onPress={() => {
                                                    handleRestore(item)
                                                }}
                                                hitSlop={10}
                                                style={({ pressed }) => [
                                                    {
                                                        opacity: pressed
                                                            ? 0.5
                                                            : 1,
                                                        minHeight: 46,
                                                        justifyContent:
                                                            'center',
                                                    },
                                                ]}
                                            >
                                                <View
                                                    style={{
                                                        ...styles.row,
                                                        backgroundColor:
                                                            colors.card,
                                                    }}
                                                >
                                                    <PlatformIcon
                                                        color={
                                                            colors.labelSecondaryColor
                                                        }
                                                        ios={{
                                                            name: cardIcons[
                                                                item.key as keyof typeof cardIcons
                                                            ].ios,
                                                            size: 17,
                                                        }}
                                                        android={{
                                                            name: cardIcons[
                                                                item.key as keyof typeof cardIcons
                                                            ]
                                                                .android as MaterialIcon,
                                                            size: 21,
                                                        }}
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.text,
                                                            {
                                                                color: colors.text,
                                                            },
                                                        ]}
                                                    >
                                                        {t(
                                                            // @ts-expect-error cannot verify the type
                                                            `cards.titles.${item.key}`,
                                                            { ns: 'navigation' }
                                                        )}
                                                    </Text>
                                                    {defaultHiddenKeys.includes(
                                                        item.key
                                                    ) ? (
                                                        <PlatformIcon
                                                            color={
                                                                colors.labelColor
                                                            }
                                                            ios={{
                                                                name: 'lock',
                                                                size: 20,
                                                            }}
                                                            android={{
                                                                name: 'lock',
                                                                size: 24,
                                                            }}
                                                        />
                                                    ) : (
                                                        <PlatformIcon
                                                            color={
                                                                isDark
                                                                    ? 'white'
                                                                    : 'black'
                                                            }
                                                            ios={{
                                                                name: 'plus.circle',
                                                                variant: 'fill',
                                                                size: 20,
                                                            }}
                                                            android={{
                                                                name: 'add_circle',
                                                                size: 24,
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                            </Pressable>
                                            {index !==
                                                filteredHiddenDashboardEntries.length -
                                                    1 && (
                                                <Divider
                                                    color={
                                                        colors.labelTertiaryColor
                                                    }
                                                    width={'100%'}
                                                />
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                        </View>
                    </View>
                    {!hasUserDefaultOrder && (
                        <View
                            style={[
                                styles.card,
                                styles.blockContainer,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Pressable
                                onPress={handleReset}
                                disabled={hasUserDefaultOrder}
                            >
                                <Text
                                    style={[
                                        styles.reset,
                                        {
                                            color: hasUserDefaultOrder
                                                ? colors.labelColor
                                                : colors.text,
                                        },
                                    ]}
                                >
                                    {t('dashboard.reset')}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                    <Text style={[styles.footer, { color: colors.labelColor }]}>
                        {t('dashboard.footer')}
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}

interface RowItemProps {
    item: ExtendedCard
    onPressDelete: () => void
    isLast: boolean
    isDragged: boolean
}

function RowItem({
    item,
    onPressDelete,
    isLast,
    isDragged,
}: RowItemProps): JSX.Element {
    const colors = useTheme().colors as Colors
    const bottomWidth = isLast || isDragged ? 0 : 1

    return (
        <View>
            <View
                style={[
                    styles.row,
                    {
                        borderBottomColor: colors.border,
                        backgroundColor: colors.card,
                        width: width - PAGE_PADDING * 2,
                        borderBottomWidth: bottomWidth,
                    },
                ]}
            >
                <PlatformIcon
                    color={colors.primary}
                    ios={{
                        name: isDragged
                            ? 'line.3.horizontal'
                            : cardIcons[item.key as keyof typeof cardIcons].ios,
                        size: 17,
                    }}
                    android={{
                        name: isDragged
                            ? 'drag_handle'
                            : (cardIcons[item.key as keyof typeof cardIcons]
                                  .android as MaterialIcon),
                        size: 21,
                    }}
                />

                <Text style={[styles.text, { color: colors.text }]}>
                    {item.text}
                </Text>
                <Pressable
                    onPress={onPressDelete}
                    disabled={!item.removable}
                    style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.5 : 1,
                        },
                    ]}
                    hitSlop={{
                        top: 13,
                        right: 15,
                        bottom: 13,
                        left: 15,
                    }}
                >
                    {item.removable && (
                        <PlatformIcon
                            color={colors.labelSecondaryColor}
                            ios={{
                                name: 'minus.circle',
                                size: 20,
                            }}
                            android={{
                                name: 'do_not_disturb_on',
                                variant: 'outlined',
                                size: 24,
                            }}
                        />
                    )}
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    outer: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    wrapper: {
        gap: 14,
    },
    block: {
        width: '100%',
        alignSelf: 'center',
        gap: 6,
    },
    blockContainer: {
        marginTop: 6,
    },
    noteContainer: {
        marginTop: 3,
    },
    noteTextContainer: {
        paddingTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 9,
        justifyContent: 'flex-start',
    },
    notesTitle: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'left',
    },
    notesMessage: {
        fontSize: 15,
        textAlign: 'left',
        marginBottom: 12,
    },
    card: {
        borderRadius: 8,
        paddingHorizontal: 0,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,

        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 16,
        flexGrow: 1,
        flexShrink: 1,
    },
    textEmpty: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        borderRadius: 8,
        justifyContent: 'center',
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
    },
    footer: {
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
    },
    reset: {
        fontSize: 16,
        marginVertical: 13,
        alignSelf: 'center',
    },
})
