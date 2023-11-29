import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from './Icon'

interface FormListProps {
    sections: FormListSections[]
}

/**
 * A component that renders a list of forms with headers and footers.
 * @param {FormListSections[]} sections - An array of sections, each containing a header, footer, and an array of items.
 * @returns {JSX.Element} - A React component that renders the list of forms.
 */
const FormList: React.FC<FormListProps> = ({ sections }) => {
    const colors = useTheme().colors as Colors
    return (
        <View style={styles.wrapper}>
            {sections.map((section, sectionIndex) =>
                // skip whole section if section.items is empty
                section.items.length === 0 ? null : (
                    <View key={sectionIndex} style={styles.block}>
                        <Text
                            style={[
                                styles.blockHeader,
                                { color: colors.labelSecondaryColor },
                            ]}
                        >
                            {section.header}
                        </Text>

                        <View
                            style={[
                                styles.blockCard,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            {section.items.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Pressable
                                        onPress={item.onPress}
                                        style={({ pressed }) => [
                                            {
                                                opacity: pressed ? 0.5 : 1,
                                            },
                                        ]}
                                        disabled={
                                            item.disabled ??
                                            item.onPress === undefined
                                        }
                                    >
                                        <View
                                            style={
                                                item.layout === 'column'
                                                    ? styles.cardColumn
                                                    : styles.cardRow
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.rowTitle,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {item.title}
                                            </Text>
                                            {item.value != null && (
                                                <Text
                                                    style={[
                                                        item.layout === 'column'
                                                            ? styles.columnDetails
                                                            : styles.rowDetails,
                                                        {
                                                            color:
                                                                item.iconColor ??
                                                                colors.labelColor,
                                                        },
                                                    ]}
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
                                                        fallback:
                                                            item.icon
                                                                .iosFallback,

                                                        size:
                                                            item.icon
                                                                .iosFallback ??
                                                            false
                                                                ? 20
                                                                : 16,
                                                    }}
                                                    android={{
                                                        name: item.icon.android,
                                                        size: 18,
                                                    }}
                                                />
                                            )}
                                        </View>
                                    </Pressable>

                                    {index < section.items.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                            iosPaddingLeft={16}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                        {section.footer != null && (
                            <Text
                                style={[
                                    styles.blockFooter,
                                    { color: colors.labelSecondaryColor },
                                ]}
                            >
                                {section.footer}
                            </Text>
                        )}
                    </View>
                )
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
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 12,
    },
    cardColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingHorizontal: 15,
        marginVertical: 12,
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
        fontSize: 16,
    },
})

export default FormList
