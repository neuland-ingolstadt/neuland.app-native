import React, { type FC } from 'react'
import { type DimensionValue, StyleSheet, View } from 'react-native'

interface DynamicComponentProps {
    width?: DimensionValue
    color?: string
}

const DynamicComponent: FC<DynamicComponentProps> = ({ width, color }) => {
    const styles = StyleSheet.create({
        container: {
            width: width ?? '95%',
            alignSelf: 'flex-end',
            borderBottomColor: color ?? 'grey',
            borderBottomWidth: StyleSheet.hairlineWidth,
        },
    })

    return <View style={styles.container} />
}

export default DynamicComponent
