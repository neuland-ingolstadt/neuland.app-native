import React from 'react'
import { StyleSheet, View } from 'react-native'

export default function DetailsBody({
    children,
}: {
    children: JSX.Element | JSX.Element[]
}): JSX.Element {
    return <View style={styles.detailsBody}>{children}</View>
}

const styles = StyleSheet.create({
    detailsBody: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexShrink: 1,
        gap: 4,
    },
})
