import WorkaroundStack from '@/components/Elements/Food/WorkaroundStack'
import { Avatar } from '@/components/Elements/Settings'
import { type Colors } from '@/stores/colors'
import { type UserKindContextType } from '@/stores/hooks/userKind'
import { DashboardContext, UserKindContext } from '@/stores/provider'
import { getContrastColor, getInitials, getNameColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useContext } from 'react'
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)
    const nameColor = getNameColor(userFullName)

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
                transparent={false}
                headerRightElement={() => (
                    <TouchableOpacity
                        onPress={() => {
                            router.push('(user)/settings')
                        }}
                    >
                        {userFullName !== '' && userKind !== 'guest' ? (
                            <View>
                                <Avatar
                                    size={29}
                                    background={nameColor}
                                    shadow={false}
                                >
                                    <Text
                                        style={{
                                            color: getContrastColor(nameColor),
                                            ...styles.iconText,
                                        }}
                                    >
                                        {getInitials(userFullName)}
                                    </Text>
                                </Avatar>
                            </View>
                        ) : (
                            <View>
                                <Ionicons
                                    name="person-circle-outline"
                                    size={28}
                                    color={colors.text}
                                />
                            </View>
                        )}
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
    iconText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
})
