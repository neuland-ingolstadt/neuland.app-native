import WorkaroundStack from '@/components/Elements/Food/WorkaroundStack'
import { type Colors } from '@/stores/colors'
import { DashboardContext } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

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
            <WorkaroundStack
                name={'Dashboard'}
                titleKey={'Neuland Next'}
                component={HomeScreen}
                largeTitle={true}
                headerRightElement={() => (
                    <TouchableOpacity
                        onPress={() => {
                            router.push('(user)/settings')
                        }}
                    >
                        <View>
                            <Ionicons
                                name="cog-outline"
                                size={24}
                                color={colors.primary}
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
        width: '94%',
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
