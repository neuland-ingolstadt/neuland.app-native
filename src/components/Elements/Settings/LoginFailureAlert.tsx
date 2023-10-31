/**
 * A component that displays an alert when login fails.
 * @param {string} errorMsg - The error message to display.
 * @param {function} resetFailure - A function to reset the login failure state.
 * @returns {JSX.Element} - A JSX element that displays the login failure alert.
 */
import { type Colors } from '@/stores/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const LoginFailureAlert = ({
    errorMsg,
    resetFailure,
}: {
    errorMsg: string
    resetFailure: () => void
}): JSX.Element => {
    const colors = useTheme().colors as Colors

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.failureContainer,
                    { backgroundColor: colors.labelBackground },
                ]}
            >
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={[styles.failureText, { color: colors.text }]}
                        >
                            Login failed
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={resetFailure}
                        style={styles.resetButtom}
                    >
                        <Ionicons name="close" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorText}>
                    <Text
                        numberOfLines={1}
                        style={{ marginTop: 4, color: colors.text }}
                    >
                        {errorMsg}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default LoginFailureAlert

const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingBottom: 10 },
    failureContainer: {
        width: '100%',
        justifyContent: 'center',

        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    failureText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    resetButtom: {
        marginLeft: 'auto',
        alignSelf: 'center',
        padding: 1,
    },
    errorText: {
        width: '90%',
        alignItems: 'flex-start',
    },
})
