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
