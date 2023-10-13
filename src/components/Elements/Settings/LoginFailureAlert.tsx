/**
 * A component that displays an alert when login fails.
 * @param {string} errorMsg - The error message to display.
 * @param {function} resetFailure - A function to reset the login failure state.
 * @returns {JSX.Element} - A JSX element that displays the login failure alert.
 */
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const LoginFailureAlert = ({
    errorMsg,
    resetFailure,
}: {
    errorMsg: string
    resetFailure: () => void
}): JSX.Element => {
    return (
        <View style={{ alignItems: 'center', paddingBottom: 10 }}>
            <View style={styles.failureContainer}>
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
                        <Text style={styles.failureText}>Login failed</Text>
                    </View>
                    <TouchableOpacity
                        onPress={resetFailure}
                        style={{
                            marginLeft: 'auto',
                        }}
                    >
                        <Ionicons name="close" size={16} color="black" />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        width: '90%',
                        alignItems: 'flex-start',
                    }}
                >
                    <Text numberOfLines={1} style={{ marginTop: 4 }}>
                        {errorMsg}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default LoginFailureAlert

const styles = StyleSheet.create({
    failureContainer: {
        backgroundColor: '#f9c0c0df',
        width: '100%',
        justifyContent: 'center',

        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    failureText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
})
