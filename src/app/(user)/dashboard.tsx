import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Card, type ExtendedCard } from '@/components/allCards'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/provider'
import { getDefaultDashboardOrder } from '@/hooks/contexts/dashboard'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { arraysEqual } from '@/utils/app-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    LayoutAnimation,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'
import { ScrollView } from 'react-native-gesture-handler'

const { width } = Dimensions.get('window')

export default function DashboardEdit(): JSX.Element {
    const childrenHeight = 44

    const {
        shownDashboardEntries,
        hiddenDashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
    } = useContext(DashboardContext)
    const { userKind } = useContext(UserKindContext)
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['settings'])

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

    useEffect(() => {
        setFilteredHiddenDashboardEntries(
            hiddenDashboardEntries.filter(
                (item) =>
                    item.exclusive !== true || item.default.includes(userKind)
            )
        )
    }, [hiddenDashboardEntries, userKind])

    const renderItem = (params: ExtendedCard): JSX.Element => {
        const onPressDelete = (): void => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            hideDashboardEntry(params.key)
        }

        return <RowItem item={params} onPressDelete={onPressDelete} />
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
                hiddenDashboardEntries.map((item) => item.key)
            ) &&
                arraysEqual(
                    defaultShown,
                    shownDashboardEntries.map((item) => item.key)
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
                                    backgroundColor: colors.card,
                                },
                            ]}
                        >
                            {shownDashboardEntries?.length === 0 ? (
                                <View
                                    style={{
                                        height: childrenHeight * 1.5,
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
                                <DragSortableView
                                    keyExtractor={(item) => item.key}
                                    dataSource={
                                        transShownDashboardEntries ?? []
                                    }
                                    childrenWidth={width}
                                    childrenHeight={childrenHeight}
                                    parentWidth={width}
                                    renderItem={renderItem}
                                    onDataChange={(data) => {
                                        updateDashboardOrder(data)
                                    }}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.block}>
                        {filteredHiddenDashboardEntries.length > 0 && (
                            <Text
                                style={[
                                    styles.sectionHeaderText,
                                    { color: colors.labelSecondaryColor },
                                ]}
                            >
                                {t('dashboard.hidden')}
                            </Text>
                        )}
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.card,
                                },
                            ]}
                        >
                            {filteredHiddenDashboardEntries.map(
                                (item, index) => (
                                    <React.Fragment key={index}>
                                        <Pressable
                                            disabled={defaultHiddenKeys.includes(
                                                item.key
                                            )}
                                            onPress={() => {
                                                handleRestore(item)
                                            }}
                                            style={({ pressed }) => [
                                                {
                                                    opacity: pressed ? 0.5 : 1,
                                                    minHeight: 44,
                                                    justifyContent: 'center',
                                                },
                                            ]}
                                        >
                                            <View style={styles.row}>
                                                <Text
                                                    style={[
                                                        styles.text,
                                                        { color: colors.text },
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
                                                            name: 'circle-check',
                                                            size: 24,
                                                        }}
                                                    />
                                                ) : (
                                                    <PlatformIcon
                                                        color={colors.primary}
                                                        ios={{
                                                            name: 'plus.circle',
                                                            variant: 'fill',
                                                            size: 20,
                                                        }}
                                                        android={{
                                                            name: 'circle-plus',
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
                            )}
                        </View>
                    </View>

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
}

function RowItem({ item, onPressDelete }: RowItemProps): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <View>
            <View
                style={[
                    styles.row,
                    {
                        backgroundColor: colors.card,
                        width: width - PAGE_PADDING * 4,
                    },
                ]}
            >
                <PlatformIcon
                    color={colors.labelTertiaryColor}
                    ios={{
                        name: 'line.3.horizontal',
                        size: 20,
                    }}
                    android={{
                        name: 'drag-handle',
                        size: 22,
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
                    hitSlop={10}
                >
                    {item.removable && (
                        <PlatformIcon
                            color={colors.labelSecondaryColor}
                            ios={{
                                name: 'minus.circle',
                                size: 20,
                            }}
                            android={{
                                name: 'circle-minus',
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
        paddingHorizontal: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        minHeight: 44,
        justifyContent: 'center',
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
        marginVertical: 12,
        alignSelf: 'center',
    },
})
