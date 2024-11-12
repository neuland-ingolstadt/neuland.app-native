import React from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Separator(): JSX.Element {
    const { styles } = useStyles(stylesheet)

    return <View style={styles.separator} />
}

const stylesheet = createStyleSheet((theme) => ({
    separator: {
        backgroundColor: theme.colors.border,
        height: 1,
        marginLeft: 50 + 12,
        marginVertical: 13,
    },
}))
