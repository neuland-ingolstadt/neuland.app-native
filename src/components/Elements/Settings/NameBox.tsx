import React, { type ReactNode } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface NameBoxProps {
    children: ReactNode
    title: string
    subTitle1: string
    subTitle2?: string
}

/**
 * A component that displays a box with a title and two subtitles.
 *
 * @param {NameBoxProps} props - The props object.
 * @param {ReactNode} props.children - The children of the component.
 * @param {string} props.title - The title of the box.
 * @param {string} props.subTitle1 - The first subtitle of the box.
 * @param {string} [props.subTitle2] - The second subtitle of the box (optional).
 * @returns {JSX.Element} - The JSX element representing the component.
 */
const NameBox = ({
    children,
    title,
    subTitle1,
    subTitle2,
}: NameBoxProps): JSX.Element => {
    const { styles } = useStyles(stylesheet)

    return (
        <>
            {children}
            <View style={styles.container}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                <Text
                    style={styles.subtitle}
                    numberOfLines={2}
                    allowFontScaling={true}
                >
                    {subTitle1}
                </Text>

                {subTitle2 !== '' && (
                    <Text style={styles.subtitle} numberOfLines={2}>
                        {subTitle2}
                    </Text>
                )}
            </View>
        </>
    )
}

export default NameBox

const stylesheet = createStyleSheet((theme) => ({
    subtitle: {
        fontSize: 12,
        overflow: 'hidden',
        lineHeight: 14,
        color: theme.colors.text,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        overflow: 'hidden',
        color: theme.colors.text,
    },
    container: {
        maxWidth: '92%',
        alignItems: 'flex-start',
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
}))
