import type React from 'react'
import { StyleSheet, View } from 'react-native'

export default function DetailsRow({
    children,
}: {
    children: JSX.Element[]
}): React.JSX.Element {
    return <View style={styles.detailsRow}>{children}</View>
}

const styles = StyleSheet.create({
    detailsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
    },
})
