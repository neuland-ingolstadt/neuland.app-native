import { type Colors } from '@/stores/colors'
import { DashboardContext } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const Stack2 = createNativeStackNavigator()

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors

    return (
        <>
            <Head>
                <title>Dashboard</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
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
                                    color={colors.primary}
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
    const { shownDashboardEntries } = React.useContext(DashboardContext)

    return (
        <>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
                <View style={styles.container}>
                    {shownDashboardEntries.map((item: any) => (
                        <React.Fragment key={item.key}>
                            {item.card()}
                        </React.Fragment>
                    ))}
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '92%',
        alignSelf: 'center',
        paddingTop: 16,
    },
    heading: {
        fontSize: 32,
        textAlign: 'center',
        paddingTop: 16,
    },
})
