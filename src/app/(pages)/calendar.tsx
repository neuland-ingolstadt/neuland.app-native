import { NoSessionError } from '@/api/thi-session-handler'
import { CalendarRow, ExamRow } from '@/components/Elements/Rows/CalendarRow'
import Divider from '@/components/Elements/Universal/Divider'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/provider'
import { type Calendar } from '@/types/data'
import { type Exam } from '@/types/utils'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
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
    const router = useRouter()

    const { userKind } = React.useContext(UserKindContext)
    const [exams, setExams] = useState<Exam[]>([])
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')

    const displayTypes = ['Events', t('pages.calendar.exams.title')]

    const [selectedData, setSelectedData] = useState<string>('Events')

    const [error, setError] = useState<Error | null>(null)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const primussUrl = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
    const handleLinkPress = (): void => {
        void Linking.openURL(
            selectedData === 'Events' ? t('pages.calendar.link') : primussUrl
        )
    }
    useEffect(() => {
        if (userKind === 'student') {
            void loadEvents()
                .then(() => {
                    setLoadingState(LoadingState.LOADED)
                })
                .catch((e) => {
                    if (e instanceof NoSessionError) {
                        router.push('(user)/login')
                    } else {
                        console.log(e)
                    }

                    setError(e)
                    setLoadingState(LoadingState.ERROR)
                })
        } else {
            setError(new Error(t('pages.calendar.exams.error')))
            setLoadingState(LoadingState.LOADED)
        }
    }, [userKind])

    async function loadEvents(): Promise<void> {
        const examList = await loadExamList()
        setExams(examList)
    }

    const onRefresh: () => void = () => {
        void loadEvents()
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }

    const data = selectedData === 'Events' ? calendar : exams
    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.scrollViewContainer}
            refreshControl={
                loadingState !== LoadingState.LOADING &&
                loadingState !== LoadingState.LOADED ? (
                    <RefreshControl
                        refreshing={loadingState === LoadingState.REFRESHING}
                        onRefresh={onRefresh}
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
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <React.Fragment key={index}>
                                {selectedData === 'Events' ? (
                                    <CalendarRow
                                        event={item as Calendar}
                                        colors={colors}
                                    />
                                ) : (
                                    <>
                                        {loadingState ===
                                            LoadingState.LOADED && (
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
                            {loadingState === LoadingState.LOADING && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.primary}
                                    />
                                </View>
                            )}
                            {userKind !== 'student' ? (
                                <View>
                                    <Text
                                        style={[
                                            styles.errorMessage,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {error?.message}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.errorInfo,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {t(
                                            'pages.calendar.exams.errorSubtitle'
                                        )}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {loadingState === LoadingState.ERROR && (
                                        <View>
                                            <Text
                                                style={[
                                                    styles.errorMessage,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {error?.message}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.errorInfo,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {t('error.refreshPull')}{' '}
                                            </Text>
                                        </View>
                                    )}
                                    {loadingState === LoadingState.LOADED && (
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
                                    )}
                                </>
                            )}
                        </>
                    )}
                </View>
                <View>
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: 'normal',
                            color: colors.labelColor,
                            paddingBottom: 25,
                            textAlign: 'justify',
                        }}
                    >
                        {t('pages.calendar.footer.part1')}
                        <Text
                            style={{
                                color: colors.text,
                                textDecorationLine: 'underline',
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
})
