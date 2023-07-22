import Divider from '@/components/Divider'
import { type Colors } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

interface Element {
    title: string
    key: string
}

interface SectionPickerProps {
    elements: Element[]
    selectedItems: string[]
    action: (item: string) => void
}

export const SectionPicker: React.FC<SectionPickerProps> = ({
    elements,
    selectedItems,
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
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingHorizontal: 5,
                                paddingVertical: 4,
                            }}
                        >
                            <Text
                                style={{
                                    marginLeft: 8,
                                    fontSize: 16,
                                    color: colors.text,
                                }}
                            >
                                {item.title}
                            </Text>
                            {selectedItems.includes(item.key) ? (
                                <Ionicons
                                    name={'checkmark-sharp'}
                                    size={18}
                                    style={{
                                        marginRight: 8,
                                    }}
                                    color={colors.primary}
                                />
                            ) : null}
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

export default SectionPicker
