import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Card, type ExtendedCard } from '@/components/allCards'
import { type Colors } from '@/components/colors'
import { DashboardContext } from '@/components/provider'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React, { useCallback } from 'react'
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
    const {
        shownDashboardEntries,
        hiddenDashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
    } = React.useContext(DashboardContext)
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['settings'])
    // add translation to shownDashboardEntries with new key transText
    const transShownDashboardEntries = shownDashboardEntries.map((item) => {
        return {
            ...item,
            // @ts-expect-error cannot verify the type
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            text: t('cards.titles.' + item.key, { ns: 'navigation' }) as string,
        }
    })

    const renderItem = (params: ExtendedCard): JSX.Element => {
        const onPressDelete = (): void => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            hideDashboardEntry(params.key)
        }

        return <RowItem item={params} onPressDelete={onPressDelete} />
    }

    const handleRestore = useCallback(
        (item: Card) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            bringBackDashboardEntry(item.key)
        },
        [bringBackDashboardEntry]
    )

    const handleReset = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
        resetOrder()
    }, [resetOrder])

    const childrenHeight = 44

    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.page}
                bounces={false}
                contentInsetAdjustmentBehavior="automatic"
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
                            {shownDashboardEntries.length === 0 ? (
                                <View
                                    style={{
                                        height: childrenHeight * 2,
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
                                    dataSource={transShownDashboardEntries}
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
                        <Pressable
                            onPress={handleReset}
                            style={({ pressed }) => [
                                {
                                    opacity: pressed ? 0.5 : 1,
                                },
                            ]}
                        >
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
    onPressDelete: () => void
}

function RowItem({ item, onPressDelete }: RowItemProps): JSX.Element {
    const colors = useTheme().colors as Colors

    const { shownDashboardEntries } = React.useContext(DashboardContext)

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
                    style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.5 : 1,
                        },
                    ]}
                >
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
                </Pressable>
            </View>

            {shownDashboardEntries.findIndex((i) => i.key === item.key) <
                shownDashboardEntries.length - 1 && (
                <Divider color={colors.labelTertiaryColor} width={'100%'} />
            )}
        </View>
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
