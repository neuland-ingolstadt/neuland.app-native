import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const OnboardingBox = ({ title }: { title: string }): JSX.Element => {
    const colors = useTheme().colors as Colors

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                },
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: colors.text,
                    },
                ]}
            >
                {title}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        padding: CARD_PADDING,
        maxWidth: 600,
    },
    text: {
        fontSize: 16,
        textAlign: 'left',
    },
})

export default OnboardingBox
