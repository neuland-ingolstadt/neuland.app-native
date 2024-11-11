import { PAGE_PADDING } from '@/utils/style-utils'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const ToggleRow = ({
    items,
    selectedElement,
    setSelectedElement,
}: {
    items: string[]
    selectedElement: number
    setSelectedElement: (element: number) => void
}): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    return (
        <View style={styles.buttonRow}>
            {items.map((item, index) => {
                return (
                    <View key={index} style={styles.buttonView}>
                        <Pressable
                            onPress={() => {
                                setSelectedElement(index)
                            }}
                        >
                            <View style={styles.buttonContainer}>
                                <Text
                                    style={styles.text(
                                        selectedElement === index
                                    )}
                                >
                                    {item}{' '}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                )
            })}
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    textSelected: {
        fontWeight: '500',
        fontSize: 15,
    },
    textNotSelected: {
        fontWeight: 'normal',
        fontSize: 15,
    },
    text(selected: boolean) {
        return {
            fontWeight: selected ? '500' : 'normal',
            color: selected ? theme.colors.primary : theme.colors.text,
            fontSize: 15,
        }
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center',
        gap: 12,
        paddingHorizontal: PAGE_PADDING,
    },
    buttonView: {
        flex: 1,
    },
    buttonContainer: {
        width: '100%',
        alignSelf: 'center',
        borderRadius: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        alignItems: 'center',

        paddingHorizontal: PAGE_PADDING,
        paddingVertical: 10,
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.text,
    },
}))

export default ToggleRow
