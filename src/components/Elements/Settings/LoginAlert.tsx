/**
 * A component that displays an alert when login fails.
 * @param {string} errorMsg - The error message to display.
 * @param {function} resetAlert - A function to reset the login failure state.
 * @returns {JSX.Element} - A JSX element that displays the login failure alert.
 */
import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

const LoginAlert = ({
    errorMsg,
    resetAlert,
    errorTitle,
}: {
    errorMsg: string
    resetAlert: () => void
    errorTitle?: string
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
                <View style={styles.outerContainer}>
                    <View style={styles.innerContainer}>
                        <Text
                            style={[styles.failureText, { color: colors.text }]}
                        >
                            {errorTitle ?? 'Login failed'}
                        </Text>
                    </View>
                    <Pressable onPress={resetAlert} style={styles.resetButtom}>
                        <PlatformIcon
                            ios={{
                                name: 'xmark',
                                size: 12,
                            }}
                            android={{
                                name: 'close',
                                size: 16,
                            }}
                            color={colors.text}
                        />
                    </Pressable>
                </View>
                <View style={styles.errorText}>
                    <Text
                        numberOfLines={2}
                        style={{ ...styles.errorMsg, color: colors.text }}
                    >
                        {errorMsg}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default LoginAlert

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
    errorMsg: {
        marginTop: 4,
    },
    outerContainer: {
        flexDirection: 'row',
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
})
