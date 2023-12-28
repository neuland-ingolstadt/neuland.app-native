import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import React, { type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'

interface NameBoxProps {
    children: ReactNode
    title: string
    loaded: boolean
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
    loaded,
    subTitle1,
    subTitle2,
}: NameBoxProps): JSX.Element => {
    const colors = useTheme().colors as Colors
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)
    const shimmerColor = [
        Color(colors.labelTertiaryColor).lighten(0.4).hex(),
        Color(colors.labelTertiaryColor).lighten(0.5).hex(),
        Color(colors.labelTertiaryColor).lighten(0.4).hex(),
    ]

    return (
        <>
            {children}
            <View style={styles.container}>
                <Text
                    style={{
                        ...styles.title,
                        color: colors.text,
                    }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                <ShimmerPlaceholder
                    visible={loaded}
                    style={{
                        ...(!loaded && styles.shimmerContainer1),
                    }}
                    shimmerStyle={styles.shimmer}
                    shimmerColors={shimmerColor}
                >
                    <Text
                        style={{
                            ...styles.subtitle,
                            color: colors.text,
                        }}
                        numberOfLines={2}
                        allowFontScaling={true}
                    >
                        {subTitle1}
                    </Text>
                </ShimmerPlaceholder>
                <ShimmerPlaceholder
                    visible={loaded}
                    style={{
                        ...(!loaded && styles.shimmerContainer2),
                    }}
                    shimmerStyle={styles.shimmer}
                    shimmerColors={shimmerColor}
                >
                    {subTitle2 !== '' && (
                        <Text
                            style={{
                                ...styles.subtitle,
                                color: colors.text,
                            }}
                        >
                            {subTitle2}
                        </Text>
                    )}
                </ShimmerPlaceholder>
            </View>
        </>
    )
}

export default NameBox

const styles = StyleSheet.create({
    shimmerContainer1: {
        width: 100,
        height: 12.5,
    },
    shimmerContainer2: {
        width: 130,
        height: 12.5,
        marginTop: 3,
    },
    shimmer: {
        borderRadius: 3,
    },
    subtitle: {
        fontSize: 12,
        overflow: 'hidden',
        lineHeight: 14,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        overflow: 'hidden',
    },
    container: {
        maxWidth: '92%',
        alignItems: 'flex-start',
        flex: 1,
        marginLeft: 16,
    },
})
