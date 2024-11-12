import { CARD_PADDING } from '@/utils/style-utils'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const OnboardingBox = ({ title }: { title: string }): JSX.Element => {
    const { styles } = useStyles(stylesheet)

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        borderRadius: 8,
        padding: CARD_PADDING,
        maxWidth: 600,
        backgroundColor: theme.colors.card,
    },
    text: {
        fontSize: 16,
        textAlign: 'left',
        color: theme.colors.text,
    },
}))

export default OnboardingBox
