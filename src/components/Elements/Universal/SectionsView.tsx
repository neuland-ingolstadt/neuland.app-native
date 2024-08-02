import { type Colors } from '@/components/colors'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const SectionView = ({
    title,
    footer,
    children,
}: {
    title: string
    footer?: string
    children: JSX.Element
}): JSX.Element => {
    const colors = useTheme().colors as Colors

    return (
        <>
            <View style={styles.sectionContainer}>
                <Text
                    style={[
                        styles.labelText,
                        {
                            color: colors.labelSecondaryColor,
                        },
                    ]}
                >
                    {title}
                </Text>
                <View
                    style={[
                        styles.sectionBox,
                        {
                            backgroundColor: colors.card,
                        },
                    ]}
                >
                    {children}
                </View>
            </View>
            {footer != null && (
                <Text
                    style={[
                        styles.footerText,
                        { color: colors.labelSecondaryColor },
                    ]}
                >
                    {footer}
                </Text>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    footerText: {
        marginTop: 6,
        fontSize: 12.5,
        paddingHorizontal: PAGE_PADDING,
    },
    labelText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionContainer: {
        marginTop: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        marginTop: 2,
        justifyContent: 'center',
    },
})

export default SectionView
