import { type Colors } from '@/stores/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React, { type FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface WhatsnewBoxProps {
    title: string
    description: string
    icon?: string
}

/**
 * A component that renders a box with a title, description and an icon.
 * @param {string} title - The title of the box.
 * @param {string} description - The description of the box.
 * @param {string} icon - The icon of the box.
 * @returns {JSX.Element} - A React component that renders the box.
 * @example
 * <WhatsnewBox title="Title" description="Description" icon="chevron-forward-circle" />
 */
const WhatsnewBox: FC<WhatsnewBoxProps> = ({ title, description, icon }) => {
    const colors = useTheme().colors as Colors
    return (
        <View style={[{ backgroundColor: colors.card }, styles.container]}>
            <Ionicons
                name={(icon as any) ?? 'chevron-forward-circle'}
                size={26}
                color={colors.primary}
                style={{ paddingRight: 15 }}
            />
            <View style={{ flexDirection: 'column', paddingRight: 30 }}>
                <Text
                    style={[
                        {
                            color: colors.text,
                        },
                        styles.title,
                    ]}
                >
                    {title}
                </Text>
                <Text
                    style={[
                        {
                            color: colors.labelColor,
                        },
                        styles.description,
                    ]}
                    numberOfLines={4}
                >
                    {description}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',

        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        width: '100%',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    description: {
        fontSize: 14,
        textAlign: 'left',
    },
})

export default WhatsnewBox
