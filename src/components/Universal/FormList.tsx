import Divider from '@/components/Universal/Divider'
import { type FormListSections, type SectionGroup } from '@/types/components'
import React from 'react'
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
}

const RenderSectionItem: React.FC<RenderSectionItemProps> = ({
    sectionIndex,
    section,
}) => {
    const { styles } = useStyles(stylesheet)
    return (
        <View key={sectionIndex} style={styles.block}>
            <View style={(styles.blockCard, styles.itemBlock)}>
                <Text style={styles.columnDetails}>{section.item}</Text>
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
    const { styles } = useStyles(stylesheet)

    return (
        <View key={sectionIndex} style={styles.block}>
            {header != null && <Text style={styles.blockHeader}>{header}</Text>}
            {children}
            {footer != null && <Text style={styles.blockFooter}>{footer}</Text>}
        </View>
    )
}

const RenderSectionItems: React.FC<{
    items: SectionGroup[]
    rowStyle?: ViewStyle
}> = ({ items, rowStyle }) => {
    const { styles } = useStyles(stylesheet)

    return (
        <View style={styles.blockCard}>
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
                                <Text style={styles.rowTitle}>
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
                                                styles.labelColor.color,
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
                                        color:
                                            item.iconColor ??
                                            styles.labelColor.color,
                                    }}
                                />
                            )}
                        </View>
                    </Pressable>

                    {index < items.length - 1 && (
                        <Divider
                            color={styles.labelTertiaryColor.color}
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
    const { styles } = useStyles(stylesheet)

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
                        />
                    </RenderSectionFrame>
                ) : null
            )}
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    block: {
        gap: 6,
    },
    blockCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 8,
    },
    blockFooter: {
        color: theme.colors.labelSecondaryColor,
        fontSize: 12,
        fontWeight: '400',
    },
    blockHeader: {
        color: theme.colors.labelSecondaryColor,
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
    },
    cardColumn: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        marginVertical: 13,
        paddingHorizontal: 15,
    },
    cardRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 13,
        paddingHorizontal: 16,
    },
    columnDetails: {
        color: theme.colors.text,
        fontSize: 16,
        paddingTop: 2,
        textAlign: 'left',
    },
    itemBlock: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    labelColor: {
        color: theme.colors.labelColor,
    },
    labelSecondaryColor: {
        color: theme.colors.labelSecondaryColor,
    },
    labelTertiaryColor: {
        color: theme.colors.labelTertiaryColor,
    },
    rowDetails: {
        fontSize: 16,
        maxWidth: '65%',
        textAlign: 'right',
    },
    rowTitle: {
        color: theme.colors.text,
        flexGrow: 1,
        flexShrink: 1,
        flexWrap: 'wrap',
        fontSize: 16,
    },
    test: {
        color: theme.colors.text,
    },
    wrapper: {
        gap: 16,
        width: '100%',
    },
}))

export default FormList
