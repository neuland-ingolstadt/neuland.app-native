import NeulandAPI from '@/api/neuland-api'
import PopUpCard from '@/components/Cards/PopUpCard'
import { IndexHeaderRight } from '@/components/Dashboard/HeaderRight'
import ErrorView from '@/components/Error/ErrorView'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import { DashboardContext } from '@/components/contexts'
import { MasonryFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import Head from 'expo-router/head'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, LayoutAnimation, Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function HomeRootScreen(): JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    const { styles } = useStyles(stylesheet)
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
                    ...styles.header,
                    paddingTop,
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
    const { styles, theme } = useStyles(stylesheet)
    const { shownDashboardEntries } = React.useContext(DashboardContext)
    const [orientation, setOrientation] = useState(
        Dimensions.get('window').width
    )
    const [columns, setColumns] = useState(
        Math.floor(Dimensions.get('window').width < 800 ? 1 : 2)
    )
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
            key={orientation}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ ...styles.container, ...styles.page }}
            showsVerticalScrollIndicator={false}
            data={shownDashboardEntries}
            renderItem={({ item, index }) => {
                let paddingStyle = {}

                if (columns !== 1) {
                    paddingStyle =
                        index % 2 === 0
                            ? { marginRight: theme.margins.page / 2 }
                            : { marginLeft: theme.margins.page / 2 }
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
                    <PopUpCard data={data?.appAnnouncements} />
                ) : (
                    <></>
                )
            }
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        paddingBottom: theme.margins.bottomSafeArea,
        paddingTop: 6,
    },
    errorContainer: { flex: 1, paddingTop: 110 },

    header: {
        backgroundColor: theme.colors.card,
        flex: 1,
    },
    item: {
        gap: 0,
        marginHorizontal: theme.margins.page,
        marginVertical: 6,
    },
    page: {
        backgroundColor: theme.colors.background,
    },
}))
