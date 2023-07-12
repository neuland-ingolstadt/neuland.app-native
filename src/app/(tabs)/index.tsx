import { type Colors } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Stack2 = createNativeStackNavigator()

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors

    return (
        <>
            <Head>
                <title>Dashboard</title>
                <meta name="Dahsboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <Stack.Screen
                options={{
                    headerShown: false,
                    headerBackButtonMenuEnabled: false,
                }}
            />
            <Stack2.Navigator>
                <Stack2.Screen
                    name="Home"
                    options={{
                        title: 'Neuland App',
                        headerShown: true,
                        headerLargeTitle: true,
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={() => {
                                    router.push('(user)/settings')
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    padding: 10,
                                }}
                            >
                                <Ionicons
                                    name="cog-outline"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        ),
                    }}
                    component={HomeScreen}
                />
            </Stack2.Navigator>
        </>
    )
}

function HomeScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.heading}>🚧🏗️⚒️</Text>

                <Text
                    style={{
                        fontSize: 16,
                        textAlign: 'center',
                        paddingTop: 16,
                        color: colors.text,
                    }}
                >
                    Nothing to see here yet. Later you will find a customizable
                    dashboard here, where you can add widgets and cards.
                </Text>
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
})
