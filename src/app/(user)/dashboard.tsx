import Divider from '@/components/Divider'
import { type Colors } from '@/stores/colors'
import { DashboardContext } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import SwipeableItem, {
    OpenDirection,
    useSwipeableItemParams,
} from 'react-native-swipeable-item'

interface Item {
    key: string
    text: string
}

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

    // update view if shownDashboardEntries changes
    useEffect(() => {
        itemRefs.current = new Map()
    }, [shownDashboardEntries, bringBackDashboardEntry, hideDashboardEntry])

    const renderItem = useCallback((params: RenderItemParams<Item>) => {
        const onPressDelete = (): void => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            hideDashboardEntry(params.item.key)
        }

        return (
            <RowItem
                {...params}
                itemRefs={itemRefs}
                onPressDelete={onPressDelete}
            />
        )
    }, [])
    return (
        <>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
                <View style={styles.container}>
                    <View
                        style={{
                            width: '92%',
                            alignSelf: 'center',
                            marginTop: 20,
                            marginBottom: 20,
                        }}
                    >
                        <Text
                            style={[
                                styles.sectionHeaderText,
                                { color: colors.labelSecondaryColor },
                            ]}
                        >
                            Shown Cards
                        </Text>
                        <DraggableFlatList
                            keyExtractor={(item) => item.key}
                            data={shownDashboardEntries}
                            renderItem={renderItem}
                            onDragEnd={({ data }) => {
                                updateDashboardOrder(data)
                            }}
                            activationDistance={10}
                            style={{ borderRadius: 10, overflow: 'hidden' }}
                            scrollEnabled={false}
                        />
                    </View>
                </View>
                <View
                    style={{
                        width: '92%',
                        alignSelf: 'center',
                    }}
                >
                    {hiddenDashboardEntries.length > 0 && (
                        <Text
                            style={[
                                styles.sectionHeaderText,
                                { color: colors.labelSecondaryColor },
                            ]}
                        >
                            Hidden Cards
                        </Text>
                    )}
                    <View
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            marginTop: 2,
                        }}
                    >
                        {hiddenDashboardEntries.map((item, index) => (
                            <React.Fragment key={index}>
                                <Pressable
                                    onPress={() => {
                                        bringBackDashboardEntry(item.key)
                                    }}
                                    style={({ pressed }) => [
                                        { opacity: pressed ? 0.5 : 1 },
                                        { padding: 8 },
                                    ]}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginVertical: 3,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: '90%',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: colors.text,
                                                    marginLeft: 8,
                                                    fontSize: 16,
                                                }}
                                            >
                                                {item.text}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                width: '10%',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Ionicons
                                                name="add-circle"
                                                size={24}
                                                color={colors.primary}
                                            />
                                        </View>
                                    </View>
                                </Pressable>
                                {index !==
                                    hiddenDashboardEntries.length - 1 && (
                                    <Divider />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                <View
                    style={{
                        width: '92%',
                        alignSelf: 'center',
                        backgroundColor: colors.card,
                        borderRadius: 8,
                        marginTop: 24,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            resetOrder()
                        }}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 16,
                                marginVertical: 12,
                                alignSelf: 'center',
                            }}
                        >
                            Reset Order
                        </Text>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        width: '92%',
                        alignSelf: 'center',
                        paddingTop: 30,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: 'normal',
                            color: colors.labelColor,
                            paddingTop: 8,
                            textAlign: 'justify',
                        }}
                    >
                        Customise your dashboard by dragging and dropping the
                        cards to your preferred order. You can also hide cards
                        by swiping left.
                    </Text>
                </View>
            </ScrollView>
        </>
    )
}

interface RowItemProps {
    item: Item
    drag: () => void
    onPressDelete: () => void
    itemRefs: React.MutableRefObject<Map<any, any>>
}

function RowItem({
    item,
    itemRefs,
    drag,
    onPressDelete,
}: RowItemProps): JSX.Element {
    const [snapPointsLeft] = useState([75])
    const colors = useTheme().colors as Colors
    useEffect(() => {
        if (item.key === 'key-0') {
            setTimeout(() => {
                itemRefs.current
                    ?.get(item.key)
                    ?.open(OpenDirection.LEFT, undefined, { animated: true })
            }, 1000)
        }
    }, [item.key])
    const { shownDashboardEntries } = React.useContext(DashboardContext)

    return (
        <ScaleDecorator>
            <SwipeableItem
                key={item.key}
                item={item}
                renderUnderlayLeft={() => (
                    <UnderlayLeft onPressDelete={onPressDelete} />
                )}
                snapPointsLeft={snapPointsLeft}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    style={[styles.row, { backgroundColor: colors.card }]}
                >
                    <Text
                        style={[styles.text, { color: colors.text }]}
                    >{`${item.text}`}</Text>
                    <Ionicons
                        name="reorder-three-outline"
                        size={24}
                        color={colors.labelSecondaryColor}
                        style={{ marginRight: 10 }}
                    />
                </TouchableOpacity>
                {shownDashboardEntries.findIndex((i) => i.key === item.key) <
                    shownDashboardEntries.length - 1 && (
                    <Divider color={colors.labelTertiaryColor} />
                )}
            </SwipeableItem>
        </ScaleDecorator>
    )
}

const UnderlayLeft = ({
    onPressDelete,
}: {
    onPressDelete: () => void
}): React.ReactElement => {
    const { percentOpen } = useSwipeableItemParams<Item>()
    const animStyle = useAnimatedStyle(
        () => ({
            opacity: percentOpen.value,
        }),
        [percentOpen]
    )

    return (
        <Animated.View
            style={[styles.row, styles.underlayLeft, animStyle]} // Fade in on open
        >
            <TouchableOpacity onPress={onPressDelete}>
                <Ionicons
                    name="trash-outline"
                    size={24}
                    color="white"
                    style={{ marginRight: 10 }}
                />
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {},
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingVertical: 5,
        alignItems: 'center',
    },
    text: {
        marginLeft: 8,
        fontSize: 16,
        marginVertical: 10,
    },
    underlayRight: {
        flex: 1,
        backgroundColor: 'teal',
        justifyContent: 'flex-start',
    },
    underlayLeft: {
        flex: 1,
        backgroundColor: 'tomato',
        justifyContent: 'flex-end',
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
})
