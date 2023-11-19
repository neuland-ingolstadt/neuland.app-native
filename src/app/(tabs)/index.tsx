import { Avatar } from '@/components/Elements/Settings'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/provider'
import { type UserKindContextType } from '@/hooks/userKind'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
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
                                <PlatformIcon
                                    color={colors.text}
                                    ios={{
                                        name: 'person.crop.circle',
                                        size: 22,
                                    }}
                                    android={{
                                        name: 'account-circle',
                                        size: 24,
                                    }}
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
            style={styles.page}
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
    page: {
        padding: PAGE_PADDING,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
        gap: 16,
    },
    iconText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
})
