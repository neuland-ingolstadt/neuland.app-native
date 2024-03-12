import { type Colors } from '@/components/colors'
import { ROW_PADDING } from '@/utils/style-utils'
import React from 'react'
import {
    type DimensionValue,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

const RowEntry = ({
    title,
    colors,
    leftChildren,
    rightChildren,
    onPress,
    maxTitleWidth,
}: {
    title: string
    colors: Colors
    leftChildren: JSX.Element
    rightChildren: JSX.Element
    onPress?: () => void
    isExamCard?: boolean
    maxTitleWidth?: DimensionValue
}): JSX.Element => {
    return (
        <Pressable onPress={onPress}>
            <View style={styles.eventContainer}>
                <View
                    style={[
                        styles.detailsContainer,
                        { maxWidth: maxTitleWidth },
                    ]}
                >
                    <Text
                        style={{ ...styles.titleText, color: colors.text }}
                        numberOfLines={2}
                        textBreakStrategy="highQuality"
                    >
                        {title}
                    </Text>
                    {leftChildren}
                </View>

                {rightChildren}
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 16,
        fontWeight: '600',

        marginBottom: 1,
    },
    eventContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    detailsContainer: {
        flexDirection: 'column',

        alignItems: 'flex-start',
        padding: ROW_PADDING,
        maxWidth: '70%',
    },
})

export default RowEntry
