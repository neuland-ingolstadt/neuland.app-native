import { type Colors } from '@/components/colors'
import { ROW_PADDING } from '@/utils/style-utils'
import React from 'react'
import { type DimensionValue, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const RowEntry = ({
    title,
    colors,
    leftChildren,
    rightChildren,
    onPress,
    maxTitleWidth,
    backgroundColor,
    icon,
}: {
    title: string
    colors: Colors
    leftChildren: JSX.Element
    rightChildren: JSX.Element
    onPress?: () => void
    isExamCard?: boolean
    maxTitleWidth?: DimensionValue
    backgroundColor?: string
    icon?: JSX.Element
}): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    return (
        <Pressable onPress={onPress}>
            <View style={{ ...styles.eventContainer, backgroundColor }}>
                <View
                    style={[
                        styles.detailsContainer,
                        { maxWidth: maxTitleWidth },
                    ]}
                >
                    <View style={styles.titleContainer}>
                        {icon}
                        <Text
                            style={styles.titleText}
                            numberOfLines={2}
                            textBreakStrategy="highQuality"
                        >
                            {title}
                        </Text>
                    </View>
                    {leftChildren}
                </View>

                {rightChildren}
            </View>
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
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
    titleContainer: { flexDirection: 'row', gap: 4, paddingBottom: 2 },
}))

export default RowEntry
