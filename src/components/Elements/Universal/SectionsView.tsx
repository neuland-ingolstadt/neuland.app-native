import { type Colors } from '@/components/colors'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const SectionView = ({
    title,
    children,
}: {
    title: string
    children: JSX.Element
}): JSX.Element => {
    const colors = useTheme().colors as Colors

    return (
        <View style={[styles.sectionContainer, { marginTop: 16 }]}>
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
    )
}

const styles = StyleSheet.create({
    labelText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionContainer: {
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
