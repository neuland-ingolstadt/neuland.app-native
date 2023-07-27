import { getContrastColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, type ViewStyle } from 'react-native'

interface CheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    style?: ViewStyle
    activeButtonStyle?: ViewStyle
    inactiveButtonStyle?: ViewStyle
}

export function Checkbox({
    checked,
    onChange,
    style = {},
    activeButtonStyle = {},
    inactiveButtonStyle = {},
}: CheckboxProps): JSX.Element {
    return (
        <Pressable
            style={[
                styles.checkboxBase,
                checked ? styles.checkboxChecked : styles.checkboxUnchecked,
                checked ? activeButtonStyle : inactiveButtonStyle,
                style,
            ]}
            onPress={() => {
                onChange(!checked)
            }}
        >
            {checked && (
                <Ionicons
                    name="checkmark-sharp"
                    size={16}
                    color={getContrastColor(
                        String(activeButtonStyle.backgroundColor) ?? '#007AFF'
                    )}
                />
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    checkboxBase: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    checkboxUnchecked: {
        backgroundColor: '#ffffff',
        borderColor: '#8E8E93',
    },
})
