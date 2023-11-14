import { type Colors } from '@/components/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface SectionPickerProps {
    title: string
    selectedItem: boolean
    action: () => void
}

/**
 * A component that renders a single selectable item with a title and a checkmark icon.
 * @param {string} title - The title of the item.
 * @param {boolean} selectedItem - Whether the item is selected.
 * @param {() => void} action - The function to be called when the item is selected.
 * @returns {JSX.Element} - The MultiSectionPicker component.
 * @example
 * <SingleSectionPicker
 *      title={'Title'}
 *      selectedItem={selected}
 *      action={() => {
 *      console.log('Action')
 *    }}
 * />
 */
const SingleSectionPicker: React.FC<SectionPickerProps> = ({
    title,
    selectedItem,
    action,
}) => {
    const colors = useTheme().colors as Colors
    return (
        <>
            <React.Fragment>
                <Pressable
                    onPress={() => {
                        action()
                    }}
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.8 : 1 },
                        { padding: 8 },
                    ]}
                >
                    <View style={styles.container}>
                        <Text style={[styles.text, { color: colors.text }]}>
                            {title}
                        </Text>
                        {selectedItem ? (
                            <Ionicons
                                name={'checkmark-sharp'}
                                size={18}
                                style={{
                                    marginRight: 8,
                                    alignSelf: 'center',
                                }}
                                color={colors.primary}
                            />
                        ) : null}
                    </View>
                </Pressable>
            </React.Fragment>
        </>
    )
}

export default SingleSectionPicker

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    text: {
        fontSize: 16,
        paddingVertical: 1,
    },
})
