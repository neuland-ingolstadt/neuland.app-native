import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type FormListSections, type SectionGroup } from '@/types/components'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from 'react-native'

import PlatformIcon from './Icon'

interface FormListProps {
    sections: FormListSections[]
    rowStyle?: ViewStyle
}

interface RenderSectionFrameProps {
    sectionIndex: number
    children: React.ReactNode
    footer?: string
    header?: string
}

interface RenderSectionItemProps {
    sectionIndex: number
    section: FormListSections
    colors: {
        card: string
        text: string
    }
}

const RenderSectionItem: React.FC<RenderSectionItemProps> = ({
    sectionIndex,
    section,
    colors,
}) => {
    return (
        <View key={sectionIndex} style={styles.block}>
            <View
                style={[
                    styles.blockCard,
                    styles.itemBlock,
                    {
                        backgroundColor: colors.card,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.columnDetails,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {section.item}
                </Text>
            </View>
        </View>
    )
}

const RenderSectionFrame: React.FC<RenderSectionFrameProps> = ({
    sectionIndex,
    children,
    footer,
    header,
}) => {
    const colors = useTheme().colors as Colors
    return (
        <View key={sectionIndex} style={styles.block}>
            {header != null && (
                <Text
                    style={[
                        styles.blockHeader,
                        { color: colors.labelSecondaryColor },
                    ]}
                >
                    {header}
                </Text>
            )}
            {children}
            {footer != null && (
                <Text
                    style={[
                        styles.blockFooter,
                        { color: colors.labelSecondaryColor },
                    ]}
                >
                    {footer}
                </Text>
            )}
        </View>
    )
}

const RenderSectionItems: React.FC<{
    items: SectionGroup[]
    rowStyle?: ViewStyle
}> = ({ items, rowStyle }) => {
    const colors = useTheme().colors as Colors

    return (
        <View style={[styles.blockCard, { backgroundColor: colors.card }]}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <Pressable
                        onPress={item.onPress}
                        style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.9 : 1,
                            },
                        ]}
                        disabled={item.disabled ?? item.onPress === undefined}
                    >
                        <View
                            style={{
                                ...(item.layout === 'column'
                                    ? styles.cardColumn
                                    : styles.cardRow),
                                ...rowStyle,
                            }}
                        >
                            {item.title != null && (
                                <Text
                                    style={[
                                        styles.rowTitle,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    {item.title}
                                </Text>
                            )}

                            {item.value != null && (
                                <Text
                                    style={[
                                        item.layout === 'column'
                                            ? styles.columnDetails
                                            : styles.rowDetails,
                                        {
                                            color:
                                                item.textColor ??
                                                colors.labelColor,
                                            fontWeight:
                                                item.fontWeight ?? 'normal',
                                        },
                                    ]}
                                    selectable={item.selectable ?? false}
                                >
                                    {item.value}
                                </Text>
                            )}
                            {item.icon != null && (
                                <PlatformIcon
                                    color={
                                        item.iconColor ??
                                        colors.labelSecondaryColor
                                    }
                                    ios={{
                                        name: item.icon.ios,
                                        fallback: item.icon.iosFallback,

                                        size:
                                            (item.icon.iosFallback ?? false)
                                                ? 20
                                                : 16,
                                    }}
                                    android={{
                                        name: item.icon.android,
                                        size: 18,
                                        variant: item.icon.androidVariant,
                                    }}
                                    // eslint-disable-next-line react-native/no-inline-styles
                                    style={{
                                        marginLeft: item.value != null ? 6 : 0,
                                        marginTop:
                                            Platform.OS === 'android' ? 2 : 0,
                                    }}
                                />
                            )}
                        </View>
                    </Pressable>

                    {index < items.length - 1 && (
                        <Divider
                            color={colors.labelTertiaryColor}
                            iosPaddingLeft={16}
                        />
                    )}
                </React.Fragment>
            ))}
        </View>
    )
}
/**
 * A component that renders a list of forms with headers and footers.
 * @param {FormListSections[]} sections - An array of sections, each containing a header, footer, and an array of items.
 * @returns {JSX.Element} - A React component that renders the list of forms.
 */
const FormList: React.FC<FormListProps> = ({ sections, rowStyle }) => {
    const colors = useTheme().colors as Colors

    return (
        <View style={styles.wrapper}>
            {sections.map((section, sectionIndex) =>
                section.items !== undefined && section.items.length > 0 ? (
                    <RenderSectionFrame
                        key={sectionIndex}
                        sectionIndex={sectionIndex}
                        header={section.header}
                        footer={section.footer}
                    >
                        <RenderSectionItems
                            items={section.items}
                            rowStyle={rowStyle}
                        />
                    </RenderSectionFrame>
                ) : section.item != null ? (
                    <RenderSectionFrame
                        key={sectionIndex}
                        sectionIndex={sectionIndex}
                        header={section.header}
                        footer={section.footer}
                    >
                        <RenderSectionItem
                            sectionIndex={sectionIndex}
                            section={section}
                            colors={colors}
                        />
                    </RenderSectionFrame>
                ) : null
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        gap: 16,
    },
    block: {
        gap: 6,
    },
    blockHeader: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
    },
    blockCard: {
        borderRadius: 8,
    },
    itemBlock: {
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 13,
    },
    cardColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingHorizontal: 15,
        marginVertical: 13,
    },
    blockFooter: {
        fontSize: 12,
        fontWeight: '400',
    },
    rowTitle: {
        fontSize: 16,
        flexGrow: 1,
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    rowDetails: {
        textAlign: 'right',
        maxWidth: '65%',
        fontSize: 16,
    },
    columnDetails: {
        textAlign: 'left',
        paddingTop: 2,
        fontSize: 16,
    },
})

export default FormList
