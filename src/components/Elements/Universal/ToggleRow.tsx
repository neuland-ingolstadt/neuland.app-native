import { type Colors } from '@/components/colors'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const ToggleRow = ({
    items,
    selectedElement,
    setSelectedElement,
}: {
    items: string[]
    selectedElement: string
    setSelectedElement: (element: string) => void
}): JSX.Element => {
    const colors = useTheme().colors as Colors // Make sure to replace `Colors` with the actual type of your colors

    return (
        <View style={styles.buttonRow}>
            {items.map((item, index) => {
                return (
                    <View key={index} style={styles.buttonView}>
                        <Pressable
                            onPress={() => {
                                setSelectedElement(item as 'Events' | 'Exams')
                            }}
                        >
                            <View
                                style={[
                                    styles.buttonContainer,
                                    {
                                        backgroundColor: colors.card,
                                        shadowColor: colors.text,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color:
                                            selectedElement === item
                                                ? colors.primary
                                                : colors.text,

                                        ...(selectedElement === item
                                            ? styles.textSelected
                                            : styles.textNotSelected),
                                    }}
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

const styles = StyleSheet.create({
    textSelected: {
        fontWeight: '500',
        fontSize: 15,
    },
    textNotSelected: {
        fontWeight: 'normal',
        fontSize: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center',
        gap: 12,
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
    },
})

export default ToggleRow
