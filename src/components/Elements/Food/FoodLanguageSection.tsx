import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type FoodLanguage } from '@/hooks/foodFilter'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export interface FoodLanguageElement {
    title: string
    key: FoodLanguage
}

/**
 * A component that renders a list of selectable items with a title and a checkmark icon.
 * @param {FoodLanguageElement[]} elements - The list of selectable items.
 * @param {string[]} selectedItems - The list of selected items.
 * @param {(item: FoodLanguage) => void} action - The function to be called when an item is selected.
 * @returns {JSX.Element} - The MultiSectionPicker component.
 */
export interface FoodLanguagePickerProps {
    elements: FoodLanguageElement[]
    selectedItem: string
    action: (item: FoodLanguage) => void
}

// ...

const MultiSectionRadio: React.FC<FoodLanguagePickerProps> = ({
    elements,
    selectedItem,
    action,
}) => {
    const colors = useTheme().colors as Colors
    return (
        <>
            {elements.map((item, index) => (
                <React.Fragment key={index}>
                    <Pressable
                        onPress={() => {
                            action(item.key)
                        }}
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.8 : 1 },
                            { padding: 8 },
                        ]}
                    >
                        <View style={styles.container}>
                            <Text style={[styles.text, { color: colors.text }]}>
                                {item.title}
                            </Text>

                            {selectedItem === item.key ? (
                                <PlatformIcon
                                    color={colors.primary}
                                    ios={{
                                        name: 'checkmark',
                                        size: 15,
                                    }}
                                    android={{
                                        name: 'check',
                                        size: 18,
                                    }}
                                />
                            ) : (
                                <></>
                            )}
                        </View>
                    </Pressable>
                    {index < elements.length - 1 && (
                        <Divider color={colors.labelTertiaryColor} />
                    )}
                </React.Fragment>
            ))}
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 8,
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        paddingVertical: 1,
    },
})

export default MultiSectionRadio
