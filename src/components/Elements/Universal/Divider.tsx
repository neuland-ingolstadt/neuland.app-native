import React, { type FC } from 'react'
import {
    type ColorValue,
    type DimensionValue,
    type FlexAlignType,
    Platform,
    StyleSheet,
    View,
} from 'react-native'

interface DividerProps {
    width?: DimensionValue
    color?: ColorValue
    position?: FlexAlignType
}

/**
 * A dynamic component that renders a horizontal line with customizable width and color.
 *
 * @param {DimensionValue} [width='95%'] - The width of the line. Defaults to '95%'.
 * @param {string} [color='grey'] - The color of the line. Defaults to 'grey'.
 * @returns {JSX.Element} - A View component that renders a horizontal line.
 */
const Divider: FC<DividerProps> = ({ width, color, position }) => {
    const styles = StyleSheet.create({
        container: {
            width: width ?? (Platform.OS === 'android' ? '92%' : '95%'),
            alignSelf:
                position ?? (Platform.OS === 'android' ? 'center' : 'flex-end'),
            borderBottomColor: color ?? 'grey',
            borderBottomWidth: StyleSheet.hairlineWidth,
        },
    })

    return <View style={styles.container} />
}

export default Divider
