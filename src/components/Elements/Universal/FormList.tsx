import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { type FormListSections, type SectionGroup } from '@/stores/types/components'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

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

    const styles = StyleSheet.create({
        wrapper: {
            width: '100%',
            padding: 16,
            gap: 16,
        },
        block: {
            gap: 6,
        },
        blockHeader: {
            fontSize: 13,
            color: colors.labelSecondaryColor,
            fontWeight: 'normal',
            textTransform: 'uppercase',
        },
        blockCard: {
            borderRadius: 8,
            backgroundColor: colors.card,
            padding: 12,
            gap: 12,
        },
        cardRow: {
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 4,
        },
        blockFooter: {
            fontSize: 12,
            color: colors.labelSecondaryColor,
            fontWeight: '400',
        },
    })

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const itemStyles = (item: SectionGroup) =>
        StyleSheet.create({
            rowTitle: {
                fontSize: 16,
                color: colors.text,
                flexGrow: 1,
                flexShrink: 1,
                flexWrap: 'wrap',
            },
            rowDetails: {
                fontSize: 16,
                color: item.iconColor ?? colors.labelColor,
            },
        })

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const pressedStyle = (pressed: boolean) =>
        StyleSheet.create({
            children: {
                opacity: pressed ? 0.5 : 1,
            },
        })

    return (
        <View style={styles.wrapper}>
            {sections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.block}>
                    <Text style={styles.blockHeader}>{section.header}</Text>

                    <View style={styles.blockCard}>
                        {section.items.map((item, index) => (
                            <React.Fragment key={index}>
                                <Pressable
                                    onPress={item.onPress}
                                    style={({ pressed }) =>
                                        pressedStyle(pressed).children
                                    }
                                    disabled={item.disabled ?? false}
                                >
                                    <View style={styles.cardRow}>
                                        <Text style={itemStyles(item).rowTitle}>
                                            {item.title}
                                        </Text>
                                        {item.value != null && (
                                            <Text
                                                style={
                                                    itemStyles(item).rowDetails
                                                }
                                            >
                                                {item.value}
                                            </Text>
                                        )}
                                        {item.icon != null && (
                                            <Ionicons
                                                name={item.icon as any}
                                                size={18}
                                                color={
                                                    item.iconColor ??
                                                    colors.labelSecondaryColor
                                                }
                                            />
                                        )}
                                    </View>
                                </Pressable>

                                {index < section.items.length - 1 && (
                                    <Divider
                                        color={colors.labelTertiaryColor}
                                        width={'100%'}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                    {section.footer != null && (
                        <Text style={styles.blockFooter}>{section.footer}</Text>
                    )}
                </View>
            ))}
        </View>
    )
}

export default FormList
