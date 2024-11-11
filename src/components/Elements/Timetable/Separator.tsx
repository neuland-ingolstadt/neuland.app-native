import React from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Separator(): JSX.Element {
    const { styles } = useStyles(stylesheet)

    return <View style={styles.separator} />
}

const stylesheet = createStyleSheet((theme) => ({
    separator: {
        marginLeft: 50 + 12,
        height: 1,
        marginVertical: 13,
        backgroundColor: theme.colors.border,
    },
}))
