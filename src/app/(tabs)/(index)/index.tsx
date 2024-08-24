import NeulandAPI from '@/api/neuland-api'
import PopUpCard from '@/components/Cards/PopUpCard'
import { IndexHeaderRight } from '@/components/Elements/Dashboard/HeaderRight'
import ErrorView from '@/components/Elements/Error/ErrorView'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { DashboardContext } from '@/components/contexts'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { MasonryFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router, useNavigation } from 'expo-router'
import Head from 'expo-router/head'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    LayoutAnimation,
    Platform,
    StyleSheet,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeRootScreen(): JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    const colors = useTheme().colors as Colors
    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50
    const paddingTop = hasDynamicIsland ? topInset : 0
    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text, i18next/no-literal-string */}
                <title>Dashboard</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>

            <View
                style={{
                    ...styles.page,
                    paddingTop,
                    backgroundColor: colors.card,
                }}
            >
                <WorkaroundStack
                    name={'Dashboard'}
                    titleKey={'navigation.dashboard'}
                    component={isPageOpen ? HomeScreen : () => <></>}
                    largeTitle={true}
                    transparent={!hasDynamicIsland}
                    headerRightElement={IndexHeaderRight}
                    androidFallback
                />
            </View>
        </>
    )
}

function HomeScreen(): JSX.Element {
    const { shownDashboardEntries } = React.useContext(DashboardContext)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [orientation, setOrientation] = useState(
        Dimensions.get('window').width
    )
    const colors = useTheme().colors as Colors
    const [columns, setColumns] = useState(
        Math.floor(Dimensions.get('window').width < 800 ? 1 : 2)
    )
    const navigation = useNavigation()
    const { t } = useTranslation(['navigation', 'settings'])
    const { data } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => await NeulandAPI.getAnnouncements(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }, [shownDashboardEntries])

    useEffect(() => {
        const handleOrientationChange = (): void => {
            setOrientation(Dimensions.get('window').width)
            setColumns(Math.floor(Dimensions.get('window').width < 500 ? 1 : 2))
        }

        const subscription = Dimensions.addEventListener(
            'change',
            handleOrientationChange
        )

        return () => {
            subscription.remove()
        }
    }, [])

    const handleScroll = (event: any): void => {
        if (Platform.OS !== 'ios') return
        const offsetY = event.nativeEvent.contentOffset.y
        setIsCollapsed(offsetY > -90)
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: isCollapsed ? undefined : colors.card,
            },
        })
    }, [isCollapsed, colors.card])

    return shownDashboardEntries === null ||
        shownDashboardEntries.length === 0 ? (
        <View style={styles.errorContainer}>
            <ErrorView
                title={t('dashboard.noShown', { ns: 'settings' })}
                message={t('dashboard.noShownDescription', { ns: 'settings' })}
                icon={{
                    ios: 'rainbow',
                    multiColor: true,
                    android: 'dashboard_customize',
                }}
                buttonText={t('dashboard.noShownButton', { ns: 'settings' })}
                onButtonPress={() => {
                    router.navigate('dashboard')
                }}
                isCritical={false}
            />
        </View>
    ) : (
        <MasonryFlashList
            onScroll={handleScroll}
            key={orientation}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{
                ...styles.container,
                backgroundColor: colors.background,
            }}
            showsVerticalScrollIndicator={false}
            data={shownDashboardEntries}
            renderItem={({ item, index }) => {
                let paddingStyle = {}

                if (columns !== 1) {
                    paddingStyle =
                        index % 2 === 0
                            ? { marginRight: PAGE_PADDING / 2 }
                            : { marginLeft: PAGE_PADDING / 2 }
                }

                return (
                    <View style={[styles.item, paddingStyle]}>
                        {item.card()}
                    </View>
                )
            }}
            keyExtractor={(item) => item.key}
            numColumns={columns}
            estimatedItemSize={114}
            ListHeaderComponent={() =>
                data !== undefined ? (
                    <PopUpCard data={data?.announcements} />
                ) : (
                    <></>
                )
            }
        />
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    errorContainer: { paddingTop: 110, flex: 1 },
    item: {
        marginVertical: 6,
        gap: 0,
        marginHorizontal: PAGE_PADDING,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
        paddingTop: 6,
    },
})
