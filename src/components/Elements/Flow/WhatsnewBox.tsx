import { type Colors } from '@/components/colors'
import { type MaterialIcon } from '@/types/material-icons'
import { useTheme } from '@react-navigation/native'
import React, { type FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

interface WhatsNewBoxProps {
    title: string
    description: string
    icon: { ios: string; android: string }
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
        <View
            style={[{ backgroundColor: colors.cardContrast }, styles.container]}
        >
            <PlatformIcon
                color={colors.primary}
                ios={{
                    name: icon.ios,
                    size: 26,
                    variableValue: 1,
                }}
                android={{
                    name: icon.android as MaterialIcon,
                    size: 28,
                }}
            />
            <View style={styles.textContainer}>
                <Text
                    style={[
                        {
                            color: colors.text,
                        },
                        styles.title,
                    ]}
                    numberOfLines={2}
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
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
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
        gap: 18,
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
        fontSize: 14.5,
        textAlign: 'left',
    },
})

export default WhatsNewBox
