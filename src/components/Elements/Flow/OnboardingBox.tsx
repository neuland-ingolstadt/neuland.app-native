import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const OnboardingBox = ({ title }: { title: string }): JSX.Element => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    // note that the colors are static since the onboarding is not dynamicly themed
    container: {
        backgroundColor: '#e5e5e5',
        borderRadius: 8,
        paddingHorizontal: 14,
        marginHorizontal: 16,
        paddingVertical: 16,
    },
    text: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'left',
    },
})

export default OnboardingBox
