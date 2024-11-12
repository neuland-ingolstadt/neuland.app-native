import { type MaterialIcon } from '@/types/material-icons'
import React, { type FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
    const { styles } = useStyles(stylesheet)
    return (
        <View style={styles.container}>
            <PlatformIcon
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
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <Text
                    style={styles.description}
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

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        width: '100%',
        gap: 18,
        backgroundColor: theme.colors.cardContrast,
    },
    textContainer: {
        flexDirection: 'column',
        paddingRight: 40,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'left',
        color: theme.colors.text,
    },
    description: {
        fontSize: 14.5,
        textAlign: 'left',
        color: theme.colors.labelColor,
    },
}))

export default WhatsNewBox
