import NeulandAPI from '@/api/neuland-api'
import PopUpCard from '@/components/Cards/PopUpCard'
import { IndexHeaderRight } from '@/components/Elements/Dashboard/HeaderRight'
import ErrorView from '@/components/Elements/Error/ErrorView'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { DashboardContext } from '@/components/contexts'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { MasonryFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router, useNavigation } from 'expo-router'
import Head from 'expo-router/head'
import React, { useEffect, useRef, useState } from 'react'
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
    const colors = useTheme().colors as Colors
    const [isPageOpen, setIsPageOpen] = useState(false)

    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50
    const navigation = useNavigation()
    const isFocused = useNavigation().isFocused()
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)

    useEffect(() => {
        // @ts-expect-error - no types for tabPress
        const unsubscribe = navigation.addListener('tabLongPress', () => {
            if (isFocused) {
                bottomSheetModalRef.current?.present()
            }
        })

        return unsubscribe
    }, [navigation, isFocused])

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>{'Dashboard'}</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>

            <View
                style={{
                    ...styles.page,
                    // workaround for status bar overlapping the header on iPhones with dynamic island
                    ...(hasDynamicIsland
                        ? {
                              paddingTop: topInset,
                              backgroundColor: colors.card,
                          }
                        : {}),
                }}
            >
                {Platform.OS === 'ios' ? (
                    <WorkaroundStack
                        name={'Dashboard'}
                        titleKey={'navigation.dashboard'}
                        component={isPageOpen ? HomeScreen : () => <></>}
                        largeTitle={true}
                        transparent={false}
                        headerRightElement={IndexHeaderRight}
                    />
                ) : (
                    <HomeScreen />
                )}
            </View>
        </>
    )
}

function HomeScreen(): JSX.Element {
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

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }, [shownDashboardEntries])

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
                    router.push('(user)/dashboard')
                }}
                isCritical={false}
            />
        </View>
    ) : (
        <View style={styles.page}>
            <MasonryFlashList
                key={orientation}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                data={shownDashboardEntries}
                renderItem={({ item, index }) => {
                    let paddingStyle = {}

                    if (columns !== 1) {
                        paddingStyle =
                            index % 2 === 0
                                ? { paddingRight: PAGE_PADDING / 2 }
                                : { paddingLeft: PAGE_PADDING / 2 }
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
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    errorContainer: { paddingTop: 110, flex: 1 },
    item: {
        marginVertical: 6,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
        paddingTop: 6,
        paddingHorizontal: PAGE_PADDING,
    },
})
