import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import React, { type ReactNode } from 'react'
import { Text, View } from 'react-native'

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
    const colors = useTheme().colors as Colors
    return (
        <>
            {children}
            <View
                style={{
                    maxWidth: '92%',
                    alignItems: 'flex-start',
                    flex: 1,
                    marginLeft: 12,
                }}
            >
                <Text
                    style={{
                        marginLeft: 4,
                        fontWeight: 'bold',
                        fontSize: 18,
                        overflow: 'hidden',
                        color: colors.text,
                    }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                <Text
                    style={{
                        marginLeft: 4,
                        fontSize: 12,
                        overflow: 'hidden',
                        lineHeight: 14,
                        color: colors.text,
                    }}
                    numberOfLines={1}
                    allowFontScaling={true}
                >
                    {subTitle1}
                </Text>
                {subTitle2 !== '' && (
                    <Text
                        style={{
                            marginLeft: 4,
                            fontSize: 12,
                            color: colors.text,
                        }}
                    >
                        {subTitle2}
                    </Text>
                )}
            </View>
        </>
    )
}

export default NameBox
