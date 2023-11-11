import WorkaroundStack from '@/components/Elements/Food/WorkaroundStack'
import { DashboardContext } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export default function Screen(): JSX.Element {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>Dashboard</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>

            <WorkaroundStack
                name={'Dashboard'}
                titleKey={'Neuland Next'}
                component={HomeScreen}
                largeTitle={true}
                transparent={true}
                headerRightElement={() => (
                    <TouchableOpacity
                        onPress={() => {
                            router.push('(user)/settings')
                        }}
                    >
                        <View>
                            <Ionicons
                                name="person-circle-outline"
                                size={29}
                                color={'white'}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            />
        </>
    )
}

function HomeScreen(): JSX.Element {
    const { shownDashboardEntries } = React.useContext(DashboardContext)

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
            <View style={styles.container}>
                <FlatList
                    data={shownDashboardEntries}
                    renderItem={({ item }) => item.card()}
                    keyExtractor={(item) => item.key}
                    numColumns={1}
                    contentContainerStyle={styles.container}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 6,
        width: '100%',
        alignSelf: 'center',
        paddingTop: 5,
        paddingBottom: 45,
    },
    heading: {
        fontSize: 32,
        textAlign: 'center',
        paddingTop: 16,
    },
})
