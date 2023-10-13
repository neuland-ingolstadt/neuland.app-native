import { type Colors } from '@/stores/colors'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const RowEntry = ({
    title,
    colors,
    leftChildren,
    rightChildren,
    onPress,
}: {
    title: string
    colors: Colors
    leftChildren: JSX.Element
    rightChildren: JSX.Element
    onPress?: () => void
    isExamCard?: boolean
}): JSX.Element => {
    return (
        <Pressable onPress={onPress}>
            <View style={styles.eventContainer}>
                <View style={styles.detailsContainer}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: colors.text,
                            marginBottom: 1,
                        }}
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
    eventContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    detailsContainer: {
        flexDirection: 'column',

        alignItems: 'flex-start',
        padding: 5,
        maxWidth: '70%',
    },
})

export default RowEntry
