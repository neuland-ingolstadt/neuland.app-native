import Divider from '@/components/Elements/Universal/Divider'
import { type Card, type ExtendedCard } from '@/components/allCards'
import { type Colors } from '@/stores/colors'
import { DashboardContext } from '@/stores/provider'
import { PAGE_PADDING } from '@/utils/stlye-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    LayoutAnimation,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import DraggableFlatList, {
    type RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { ScrollView } from 'react-native-gesture-handler'

export default function DashboardEdit(): JSX.Element {
    const {
        shownDashboardEntries,
        hiddenDashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
    } = React.useContext(DashboardContext)
    const colors = useTheme().colors as Colors
    const itemRefs = useRef(new Map())
    const [refresh, setRefresh] = useState(false)
    const { t } = useTranslation(['settings'])
    // add translation to shownDashboardEntries with new key transText
    const transShownDashboardEntries = shownDashboardEntries.map((item) => {
        return {
            ...item,
            text: t('cards.titles.' + item.key, { ns: 'navigation' }),
        }
    })
    // update view if shownDashboardEntries changes
    useEffect(() => {
        itemRefs.current = new Map()
    }, [
        shownDashboardEntries,
        bringBackDashboardEntry,
        hideDashboardEntry,
        refresh,
    ])

    const renderItem = (
        params: RenderItemParams<ExtendedCard>
    ): JSX.Element => {
        const onPressDelete = (): void => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            hideDashboardEntry(params.item.key)
            setRefresh(!refresh)
        }

        return (
            <RowItem
                {...params}
                itemRefs={itemRefs}
                onPressDelete={onPressDelete}
            />
        )
    }

    const handleRestore = useCallback(
        (item: Card) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            bringBackDashboardEntry(item.key)
            setRefresh(!refresh)
        },
        [bringBackDashboardEntry, refresh]
    )

    const handleReset = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
        resetOrder()
        setRefresh(!refresh)
    }, [resetOrder, refresh])

    return (
        <View>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.page}
            >
                <View style={styles.wrapper}>
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
                            <DraggableFlatList
                                keyExtractor={(item) => item.key}
                                data={transShownDashboardEntries}
                                renderItem={renderItem}
                                onDragEnd={({ data }) => {
                                    updateDashboardOrder(data)
                                }}
                                activationDistance={10}
                                style={styles.dragList}
                                scrollEnabled={false}
                            />
                        </View>
                    </View>

                    <View style={styles.block}>
                        {hiddenDashboardEntries.length > 0 && (
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
                            {hiddenDashboardEntries.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Pressable
                                        onPress={() => {
                                            handleRestore(item)
                                        }}
                                        style={({ pressed }) => [
                                            {
                                                opacity: pressed ? 0.5 : 1,
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
                                                    'cards.titles.' +
                                                        t(item.key),
                                                    { ns: 'navigation' }
                                                )}
                                            </Text>
                                            <Ionicons
                                                name="add-circle"
                                                size={24}
                                                color={colors.primary}
                                            />
                                        </View>
                                    </Pressable>
                                    {index !==
                                        hiddenDashboardEntries.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                            width={'100%'}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>

                    <View
                        style={[styles.card, { backgroundColor: colors.card }]}
                    >
                        <Pressable onPress={handleReset}>
                            <Text
                                style={[
                                    styles.reset,
                                    {
                                        color: colors.text,
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
    drag: () => void
    onPressDelete: () => void
    itemRefs: React.MutableRefObject<Map<any, any>>
}

function RowItem({ item, drag, onPressDelete }: RowItemProps): JSX.Element {
    const colors = useTheme().colors as Colors

    const { shownDashboardEntries } = React.useContext(DashboardContext)

    return (
        <ScaleDecorator>
            <TouchableOpacity
                activeOpacity={1}
                onLongPress={drag}
                style={[
                    styles.row,
                    {
                        backgroundColor: colors.card,
                    },
                ]}
            >
                <Ionicons
                    name="reorder-three-outline"
                    size={24}
                    color={colors.labelTertiaryColor}
                />

                <Text style={[styles.text, { color: colors.text }]}>
                    {item.text}
                </Text>

                <Ionicons
                    name="remove-circle-outline"
                    size={24}
                    color={colors.labelSecondaryColor}
                    onPress={onPressDelete}
                />
            </TouchableOpacity>

            {shownDashboardEntries.findIndex((i) => i.key === item.key) <
                shownDashboardEntries.length - 1 && (
                <Divider color={colors.labelTertiaryColor} width={'100%'} />
            )}
        </ScaleDecorator>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    wrapper: {
        gap: 16,
    },
    block: {
        width: '100%',
        alignSelf: 'center',
        gap: 6,
    },
    card: {
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 9,
    },
    text: {
        fontSize: 16,
        flexGrow: 1,
        flexShrink: 1,
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
    },
    dragList: {
        overflow: 'hidden',
    },
    footer: {
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'left',
    },
    reset: {
        fontSize: 16,
        marginVertical: 12,
        alignSelf: 'center',
    },
})
