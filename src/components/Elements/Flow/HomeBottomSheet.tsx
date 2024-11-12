import { BottomSheetView } from '@gorhom/bottom-sheet'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const HomeBottomSheet = (): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    return (
        <BottomSheetView style={styles.contentContainer}>
            <View>
                <Text style={styles.text}>{'Report a problem'}</Text>
            </View>
        </BottomSheetView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: {
        flex: 1,
        paddingHorizontal: theme.margins.page,
    },
    text: {
        color: theme.colors.text,
        fontSize: 21,
        fontWeight: 'bold',
    },
}))
