import { type Colors } from '@/stores/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React, { type FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface WhatsNewBoxProps {
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
 * <WhatsNewBox title="Title" description="Description" icon="chevron-forward-circle" />
 */
const WhatsNewBox: FC<WhatsNewBoxProps> = ({ title, description, icon }) => {
    const colors = useTheme().colors as Colors
    return (
        <View style={[{ backgroundColor: colors.card }, styles.container]}>
            <Ionicons
                name={(icon as any) ?? 'chevron-forward-circle'}
                size={26}
                color={colors.primary}
                style={styles.icon}
            />
            <View style={styles.textContainer}>
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
                    adjustsFontSizeToFit={true}
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
    },
    textContainer: {
        flexDirection: 'column',
        paddingRight: 40,
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
    icon: {
        paddingRight: 20,
    },
})

export default WhatsNewBox
