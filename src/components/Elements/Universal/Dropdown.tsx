import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import SelectDropdown from 'react-native-select-dropdown'

interface Props {
    data: string[]
    defaultValue: string
    defaultText: string
    onSelect: (selectedItem: string) => void
    selected: string
    width?: number
}

/**
 * A dropdown component that uses `react-native-select-dropdown` library.
 *
 * @param data - An array of strings that represents the dropdown options.
 * @param defaultValue - The default value of the dropdown.
 * @param onSelect - A function that is called when an option is selected.
 * @param selected - The currently selected option.
 * @param width - The width of the dropdown.
 */
const Dropdown: React.FC<Props> = ({
    data,
    defaultValue,
    onSelect,
    width = 100,
}) => {
    const colors = useTheme().colors as Colors
    return (
        <SelectDropdown
            data={data}
            defaultValue={defaultValue}
            dropdownStyle={{
                ...styles.dropdown,
                backgroundColor: colors.card,
            }}
            onSelect={(selectedItem: string) => {
                onSelect(selectedItem)
            }}
            renderButton={(selectedItem, isOpened) => {
                return (
                    <View
                        style={[
                            styles.dropdownButton,
                            {
                                backgroundColor: colors.datePickerBackground,

                                width,
                            },
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            allowFontScaling={false}
                            style={{
                                color: colors.text,
                            }}
                        >
                            {selectedItem}
                        </Text>
                    </View>
                )
            }}
            renderItem={(item, index, isSelected) => {
                return (
                    <View
                        style={{
                            ...styles.rowHeight,
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        }}
                    >
                        <Text
                            style={{
                                ...styles.buttonText,
                                color: colors.text,
                                ...(isSelected === true
                                    ? styles.selectedText
                                    : {}),
                            }}
                        >
                            {item}
                        </Text>
                    </View>
                )
            }}
        />
    )
}

const styles = StyleSheet.create({
    dropdownButton: {
        borderRadius: 8,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
    },
    rowHeight: {
        height: 38,
        justifyContent: 'center',
        borderBottomWidth: 1,
    },
    dropdown: {
        borderRadius: 8,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0.1, height: 0.1 },
    },
    selectedText: {
        fontWeight: '500',
    },
})

export default Dropdown

export const DropdownButton: React.FC<{
    children: React.ReactNode
    onPress: () => void
}> = ({ children, onPress }) => {
    const colors = useTheme().colors as Colors
    return (
        <TouchableOpacity onPress={onPress}>
            <View
                style={[
                    styles.dropdownButton,
                    {
                        backgroundColor: colors.datePickerBackground,
                    },
                ]}
            >
                <Text
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={{
                        color: colors.text,
                    }}
                >
                    {children}
                </Text>
            </View>
        </TouchableOpacity>
    )
}
