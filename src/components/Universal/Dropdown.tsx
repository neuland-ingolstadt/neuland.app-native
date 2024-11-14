import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import SelectDropdown from 'react-native-select-dropdown'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
    data: string[]
    defaultValue: string
    onSelect: (selectedItem: string) => void
    reset?: boolean
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
    reset = false,
    width = 100,
}) => {
    const { styles } = useStyles(stylesheet)
    const ref = React.createRef<SelectDropdown>()

    useEffect(() => {
        if (ref.current != null && reset) {
            ref.current?.selectIndex(0)
        }
    }, [reset])

    return (
        <SelectDropdown
            ref={ref}
            data={data}
            defaultValue={defaultValue}
            dropdownStyle={styles.dropdown}
            onSelect={(selectedItem: string) => {
                onSelect(selectedItem)
            }}
            renderButton={(selectedItem, isOpened) => {
                return (
                    <View
                        style={[
                            styles.dropdownButton,
                            {
                                width,
                            },
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            allowFontScaling={false}
                            style={styles.itemText}
                        >
                            {selectedItem}
                        </Text>
                    </View>
                )
            }}
            renderItem={(item, index, isSelected) => {
                return (
                    <View style={styles.rowHeight}>
                        <Text
                            style={{
                                ...styles.buttonText,
                                ...(isSelected ? styles.selectedText : {}),
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

export default Dropdown

export const DropdownButton: React.FC<{
    children: React.ReactNode
    onPress: () => void
}> = ({ children, onPress }) => {
    const { styles } = useStyles(stylesheet)
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.dropdownButton}>
                <Text
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={styles.text}
                >
                    {children}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    buttonText: {
        color: theme.colors.text,
        fontSize: 15,
        textAlign: 'center',
    },
    dropdown: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        shadowOffset: { width: 0.1, height: 0.1 },
        shadowOpacity: 0.3,
    },
    dropdownButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.datePickerBackground,
        borderRadius: theme.radius.md,
        height: 32,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    itemText: {
        color: theme.colors.text,
    },
    rowHeight: {
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        height: 38,
        justifyContent: 'center',
    },
    selectedText: {
        fontWeight: '500',
    },
    text: {
        color: theme.colors.text,
    },
}))
