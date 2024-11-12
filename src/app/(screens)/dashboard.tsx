import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Card, type ExtendedCard } from '@/components/allCards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { cardIcons } from '@/components/icons'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { type MaterialIcon } from '@/types/material-icons'
import { arraysEqual } from '@/utils/app-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { toast } from 'burnt'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    LayoutAnimation,
    Platform,
    Pressable,
    Text,
    View,
} from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'
import { ScrollView } from 'react-native-gesture-handler'
import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation(['settings'])
    const [draggedId, setDraggedId] = useState<number | null>(null)
    const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)
    const [unavailableCards, setUnavailableCards] = useState<Card[]>([])
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

    const updateHoveredKeyWorklet = (newKey: number): void => {
        'worklet'
        if (newHoveredKeyShared.value !== newKey) {
            if (Platform.OS === 'ios' && newHoveredKeyShared.value !== -1) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
            }
            newHoveredKeyShared.value = newKey
        }
    }

    const resetHoveredKey = (): void => {
        newHoveredKeyShared.value = -1
    }

    useEffect(() => {
        setFilteredHiddenDashboardEntries(
            hiddenDashboardEntries.concat(unavailableCards)
        )
    }, [hiddenDashboardEntries, userKind, unavailableCards])

    const renderItem = (params: ExtendedCard): JSX.Element => {
        const onPressDelete = (): void => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            hideDashboardEntry(params.key)
        }
        const isLast =
            shownDashboardEntries?.[shownDashboardEntries.length - 1].key ===
            params.key

        return (
            <RowItem
                item={params}
                onPressDelete={onPressDelete}
                isLast={isLast}
                isDragged={
                    draggedId !== null &&
                    draggedId === transShownDashboardEntries?.indexOf(params)
                }
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
        resetOrder(userKind ?? 'guest')
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        if (Platform.OS === 'ios') {
            void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            )
        }
    }, [resetOrder])

    useEffect(() => {
        const { hidden, shown } = getDefaultDashboardOrder(userKind)
        const defaultHidden = hidden.map((item) => item)
        const defaultShown = shown.map((item) => item)

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
    }, [shownDashboardEntries, hiddenDashboardEntries, userKind])

    useEffect(() => {
        const keys = getDefaultDashboardOrder(userKind).unavailable
        const cards = keys.map((key) => {
            return {
                key,
                removable: false,
                initial: [],
                allowed: [],
                card: () => <></>,
            }
        })
        setUnavailableCards(cards)
    }, [userKind])

    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.page}
                bounces={false}
                contentInsetAdjustmentBehavior="automatic"
                scrollEnabled={draggedId === null}
            >
                <View style={styles.wrapper}>
                    {userKind === USER_GUEST && (
                        <Pressable
                            style={[styles.card, styles.noteContainer]}
                            onPress={() => {
                                router.navigate('login')
                            }}
                        >
                            <View style={styles.noteTextContainer}>
                                <PlatformIcon
                                    ios={{
                                        name: 'lock',
                                        size: 20,
                                    }}
                                    android={{
                                        name: 'lock',
                                        size: 24,
                                    }}
                                />
                                <Text style={styles.notesTitle}>
                                    {t('dashboard.unavailable.title')}
                                </Text>
                            </View>

                            <Text style={styles.notesMessage}>
                                {t('dashboard.unavailable.message')}
                            </Text>
                        </Pressable>
                    )}
                    <View style={styles.block}>
                        <Text style={styles.sectionHeaderText}>
                            {t('dashboard.shown')}
                        </Text>
                        <View style={[styles.card, styles.shownBg]}>
                            {shownDashboardEntries?.length === 0 ? (
                                <View
                                    style={{
                                        height: childrenHeight * 1.5,

                                        ...styles.emptyContainer,
                                    }}
                                >
                                    <Text style={styles.textEmpty}>
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
                                            updateDashboardOrder(
                                                data.map((x) => x.key)
                                            )
                                        }}
                                        onClickItem={() => {
                                            toast({
                                                title: t('toast.dashboard', {
                                                    ns: 'common',
                                                }),
                                                preset: 'custom',
                                                haptic: 'warning',
                                                duration: 2,
                                                from: 'top',
                                                icon: {
                                                    ios: {
                                                        name: 'hand.draw',
                                                        color: styles.primary
                                                            .color,
                                                    },
                                                },
                                            })
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
                                            setDraggedId(index)
                                            if (Platform.OS === 'ios') {
                                                void Haptics.impactAsync(
                                                    Haptics.ImpactFeedbackStyle
                                                        .Rigid
                                                )
                                            }
                                        }}
                                        onDragEnd={() => {
                                            resetHoveredKey()
                                            setDraggedId(null)
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
                            <Text style={styles.sectionHeaderText}>
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
                                                disabled={!item.removable}
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
                                                <View style={styles.row}>
                                                    <PlatformIcon
                                                        style={styles.minusIcon}
                                                        ios={{
                                                            name: cardIcons[
                                                                item.key as keyof typeof cardIcons
                                                            ]?.ios,
                                                            size: 17,
                                                        }}
                                                        android={{
                                                            name: cardIcons[
                                                                item.key as keyof typeof cardIcons
                                                            ]
                                                                ?.android as MaterialIcon,
                                                            size: 21,
                                                            variant: 'outlined',
                                                        }}
                                                    />
                                                    <Text style={styles.text}>
                                                        {t(
                                                            // @ts-expect-error cannot verify the type
                                                            `cards.titles.${item.key}`,
                                                            { ns: 'navigation' }
                                                        )}
                                                    </Text>
                                                    {!item.removable ? (
                                                        <PlatformIcon
                                                            style={
                                                                styles.minusIcon
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
                                                <Divider width={'100%'} />
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                        </View>
                    </View>
                    {!hasUserDefaultOrder && (
                        <View style={[styles.card, styles.blockContainer]}>
                            <Pressable
                                onPress={handleReset}
                                disabled={hasUserDefaultOrder}
                            >
                                <Text style={styles.reset(hasUserDefaultOrder)}>
                                    {t('dashboard.reset')}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                    <Text style={styles.footer}>{t('dashboard.footer')}</Text>
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
    const { styles } = useStyles(stylesheet)
    const bottomWidth = isLast || isDragged ? 0 : 1

    return (
        <View>
            <View
                style={[
                    styles.row,
                    styles.outerRow,
                    {
                        width: width - PAGE_PADDING * 2,
                        borderBottomWidth: bottomWidth,
                    },
                ]}
            >
                <PlatformIcon
                    ios={{
                        name: isDragged
                            ? 'line.3.horizontal'
                            : cardIcons[item.key as keyof typeof cardIcons]
                                  ?.ios,
                        size: 17,
                    }}
                    android={{
                        name: isDragged
                            ? 'drag_handle'
                            : (cardIcons[item.key as keyof typeof cardIcons]
                                  ?.android as MaterialIcon),
                        size: 21,
                        variant: 'outlined',
                    }}
                />

                <Text style={styles.text}>{item.text}</Text>
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
                            ios={{
                                name: 'minus.circle',
                                size: 20,
                            }}
                            android={{
                                name: 'do_not_disturb_on',
                                variant: 'outlined',
                                size: 24,
                            }}
                            style={styles.minusIcon}
                        />
                    )}
                </Pressable>
            </View>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
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
        backgroundColor: theme.colors.card,
    },
    noteContainer: {
        marginTop: 3,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.card,
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
        color: theme.colors.primary,
    },
    notesMessage: {
        fontSize: 15,
        textAlign: 'left',
        marginBottom: 12,
        color: theme.colors.text,
    },
    card: {
        borderRadius: 8,
        paddingHorizontal: 0,
        overflow: 'hidden',
    },
    shownBg: {
        backgroundColor: theme.colors.background,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: theme.colors.card,
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 16,
        flexGrow: 1,
        flexShrink: 1,
        color: theme.colors.text,
    },
    textEmpty: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.text,
    },
    emptyContainer: {
        borderRadius: 8,
        justifyContent: 'center',
        backgroundColor: theme.colors.card,
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        color: theme.colors.labelSecondaryColor,
    },
    footer: {
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        color: theme.colors.labelColor,
    },
    reset: (hasUserDefaultOrder: boolean) => ({
        fontSize: 16,
        marginVertical: 13,
        alignSelf: 'center',
        color: hasUserDefaultOrder
            ? theme.colors.labelColor
            : theme.colors.text,
    }),
    minusIcon: {
        color: theme.colors.labelSecondaryColor,
    },
    primary: {
        color: theme.colors.primary,
    },
    outerRow: {
        borderColor: theme.colors.border,
    },
}))
