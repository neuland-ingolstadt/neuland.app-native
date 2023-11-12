import { Avatar } from '@/components/Elements/Settings'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/stores/colors'
import { type UserKindContextType } from '@/stores/hooks/userKind'
import { DashboardContext, UserKindContext } from '@/stores/provider'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
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

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)

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
                                    background={colors.primary}
                                    shadow={false}
                                >
                                    <Text
                                        style={{
                                            color: getContrastColor(
                                                colors.primary
                                            ),
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
                                    color={colors.primary}
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
        <FlatList
            contentInsetAdjustmentBehavior="automatic"
            style={styles.container}
            showsVerticalScrollIndicator={false}
            data={shownDashboardEntries}
            renderItem={({ item }) => item.card()}
            keyExtractor={(item) => item.key}
            numColumns={1}
            contentContainerStyle={styles.container}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 6,
        width: '100%',
        alignSelf: 'center',
        paddingTop: 5,
        paddingBottom: 50,
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
