import { NoSessionError } from '@/api/thi-session-handler'
import { EventRow, ExamRow } from '@/components/Elements/Pages/CalendarRow'
import Divider from '@/components/Elements/Universal/Divider'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/stores/colors'
import { UserKindContext } from '@/stores/provider'
import { type Exam, calendar, loadExamList } from '@/utils/calendar-utils'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
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
    const [exams, setExams] = useState<Exam[]>([])
    const colors = useTheme().colors as Colors
    const displayTypes = ['Events', 'Exams']

    const [selectedData, setSelectedData] = useState<string>('Events')

    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
    const [error, setError] = useState<Error | null>(null)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const primussUrl = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
    const calendarUrl =
        'https://www.thi.de/en/international/studies/examination/semester-dates/'
    const handleLinkPress = (): void => {
        void Linking.openURL(
            selectedData === 'Events' ? calendarUrl : primussUrl
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
                        // router.replace('login')
                    } else {
                        console.error(e)
                    }

                    setError(e)
                    setLoadingState(LoadingState.ERROR)
                })
        } else {
            setError(new Error('Not a student'))
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
                                    <EventRow event={item} colors={colors} />
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
                                        Sign in to see your exams.
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
                                                An error occurred while loading
                                                the data.{'\n'}Pull down to
                                                refresh.
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
                                                No data found
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.errorInfo,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                Please try again later.
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </View>
                <View
                    style={{
                        width: '92%',
                        alignSelf: 'center',
                        paddingBottom: 50,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: 'normal',
                            color: colors.labelColor,
                            paddingBottom: 25,
                            textAlign: 'justify',
                        }}
                    >
                        All information without guarantee. Binding information
                        is only available directly on the{' '}
                        <Text
                            style={{
                                color: colors.text,
                                textDecorationLine: 'underline',
                            }}
                            onPress={handleLinkPress}
                        >
                            university website
                        </Text>
                        .
                    </Text>
                </View>
            </>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
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
        width: '95%',
        marginTop: 14,
        marginBottom: 20,
        justifyContent: 'center',
    },
})
