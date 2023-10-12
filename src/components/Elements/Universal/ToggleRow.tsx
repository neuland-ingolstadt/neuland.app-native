import { type Colors } from '@/stores/colors'
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
    const itemCnt = items.length

    return (
        <View style={styles.buttonRow}>
            {items.map((item, index) => {
                const isFirstDay = index === 0
                const isLastDay = index === itemCnt - 1
                const buttonStyle = [
                    { flex: 1, marginHorizontal: 4 },
                    isFirstDay ? { marginLeft: 0 } : null,
                    isLastDay ? { marginRight: 0 } : null,
                ]

                return (
                    <View style={buttonStyle} key={index}>
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
                                        fontSize: 15,
                                        fontWeight:
                                            selectedElement === item
                                                ? '500'
                                                : 'normal',
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
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        alignSelf: 'center',
        paddingTop: 16,
        paddingBottom: 6,
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

        paddingHorizontal: 16,
        paddingVertical: 10,
    },
})

export default ToggleRow
