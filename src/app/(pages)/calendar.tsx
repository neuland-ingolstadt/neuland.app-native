import { NoSessionError } from '@/api/thi-session-handler'
import { CalendarRow, ExamRow } from '@/components/Elements/Rows/CalendarRow'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/provider'
import { useRefreshByUser } from '@/hooks'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { type Calendar } from '@/types/data'
import { guestError, networkError } from '@/utils/api-utils'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'

export default function CalendarPage(): JSX.Element {
    const { userKind } = React.useContext(UserKindContext)
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const displayTypes = ['Events', t('pages.calendar.exams.title')]
    const [selectedData, setSelectedData] = useState<string>('Events')
    const primussUrl = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
    const handleLinkPress = (): void => {
        void Linking.openURL(
            selectedData === 'Events'
                ? t('pages.calendar.calendar.link')
                : primussUrl
        )
    }

    const {
        data: exams,
        error,
        isLoading,
        isError,
        isPaused,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ['exams'],
        queryFn: loadExamList,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.push('(user)/login')
                return false
            }
            return failureCount < 3
        },
        enabled: userKind !== USER_GUEST,
    })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
    const data = selectedData === 'Events' ? calendar : exams

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.scrollViewContainer}
            refreshControl={
                isSuccess ? (
                    <RefreshControl
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                ) : undefined
            }
        >
            <>
                <ToggleRow
                    items={displayTypes}
                    selectedElement={selectedData}
                    setSelectedElement={setSelectedData}
                />

                <View
                    style={[
                        styles.itemsContainer,
                        { backgroundColor: colors.card },
                    ]}
                >
                    {data != null && data.length > 0 ? (
                        data.map((item, index) => (
                            <React.Fragment key={index}>
                                {selectedData === 'Events' ? (
                                    <CalendarRow
                                        event={item as Calendar}
                                        colors={colors}
                                    />
                                ) : (
                                    <>
                                        {isSuccess && (
                                            <ExamRow
                                                event={item}
                                                colors={colors}
                                            />
                                        )}
                                    </>
                                )}
                                {index !== data.length - 1 && (
                                    <Divider
                                        color={colors.labelTertiaryColor}
                                        iosPaddingLeft={16}
                                    />
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <>
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.primary}
                                    />
                                </View>
                            ) : isSuccess ? (
                                <View>
                                    <Text
                                        style={[
                                            styles.errorMessage,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {t(
                                            'pages.calendar.calendar.noData.title'
                                        )}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.errorInfo,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {t(
                                            'pages.calendar.calendar.noData.subtitle'
                                        )}
                                    </Text>
                                </View>
                            ) : isError ? (
                                <ErrorView
                                    title={error?.message ?? t('error.title')}
                                    onButtonPress={() => {
                                        void refetchByUser()
                                    }}
                                    inModal
                                />
                            ) : isPaused && !isSuccess ? (
                                <ErrorView title={networkError} inModal />
                            ) : userKind === USER_GUEST ? (
                                <ErrorView title={guestError} inModal />
                            ) : null}
                        </>
                    )}
                </View>
                <View>
                    <Text
                        style={{
                            ...styles.footerText1,
                            color: colors.labelColor,
                        }}
                    >
                        {t('pages.calendar.footer.part1')}
                        <Text
                            style={{
                                color: colors.text,
                                ...styles.footerText2,
                            }}
                            onPress={handleLinkPress}
                        >
                            {t('pages.calendar.footer.part2')}
                        </Text>
                        .
                    </Text>
                </View>
            </>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    scrollViewContainer: {
        gap: PAGE_PADDING,
        paddingBottom: MODAL_BOTTOM_MARGIN,
    },
    errorMessage: {
        paddingTop: 20,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        paddingBottom: 20,
    },
    loadingContainer: {
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemsContainer: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
    },
    footerText1: {
        fontSize: 12,
        fontWeight: 'normal',
        paddingBottom: 25,
        textAlign: 'justify',
    },
    footerText2: {
        textDecorationLine: 'underline',
    },
})
