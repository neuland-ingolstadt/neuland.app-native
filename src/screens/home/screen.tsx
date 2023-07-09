import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export function HomeScreen(): JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.heading}>🚧🏗️⚒️</Text>
                <Text style={styles.text}>Nothing here yet</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    innerContainer: {
        maxWidth: 600,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 32,
        textAlign: 'center',
        paddingTop: 16,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        paddingTop: 16,
    },
})
