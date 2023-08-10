import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet } from 'react-native'
import SelectDropdown from 'react-native-select-dropdown'

interface Props {
    data: string[]
    defaultValue: string
    defaultText: string
    onSelect: (selectedItem: string) => void
    selected: string
}

/**
 * A dropdown component that uses `react-native-select-dropdown` library.
 *
 * @param data - An array of strings that represents the dropdown options.
 * @param defaultValue - The default value of the dropdown.
 * @param defaultText - The default text of the dropdown.
 * @param onSelect - A function that is called when an option is selected.
 * @param selected - The currently selected option.
 */
export const Dropdown: React.FC<Props> = ({
    data,
    defaultValue,
    defaultText,
    onSelect,
    selected,
}) => {
    const colors = useTheme().colors as Colors
    return (
        <SelectDropdown
            data={data}
            defaultValue={defaultValue}
            defaultButtonText={defaultText}
            buttonTextAfterSelection={() => {
                return selected
            }}
            rowTextForSelection={(item, index) => {
                return item
            }}
            buttonStyle={[
                styles.dropdownButton,
                {
                    backgroundColor: colors.datePickerBackground,
                },
            ]}
            buttonTextStyle={{
                color: colors.text,
                fontSize: 15,
            }}
            rowTextStyle={{
                color: colors.text,
                fontSize: 17,
            }}
            rowStyle={{
                backgroundColor: colors.datePickerBackground,
                borderBottomColor: colors.labelTertiaryColor,
                height: 45,
            }}
            dropdownStyle={[
                styles.dropdownStyle,
                {
                    backgroundColor: colors.card,
                },
            ]}
            selectedRowStyle={{
                backgroundColor: colors.primary,
            }}
            selectedRowTextStyle={{
                color: colors.text,
                fontWeight: '500',
            }}
            onSelect={(selectedItem) => {
                onSelect(selectedItem)
            }}
        />
    )
}

const styles = StyleSheet.create({
    dropdownButton: {
        borderRadius: 8,
        width: 90,
        height: 32,
        justifyContent: 'center',
    },
    dropdownStyle: {
        height: 250,
        borderRadius: 8,
    },
})
