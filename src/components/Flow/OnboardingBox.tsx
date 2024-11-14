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
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        maxWidth: 600,
        padding: theme.margins.card,
    },
    text: {
        color: theme.colors.text,
        fontSize: 16,
        textAlign: 'left',
    },
}))

export default OnboardingBox
