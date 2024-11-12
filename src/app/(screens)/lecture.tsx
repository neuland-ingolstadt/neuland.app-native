import ErrorView from '@/components/Elements/Error/ErrorView'
import DetailsBody from '@/components/Elements/Timetable/DetailsBody'
import DetailsRow from '@/components/Elements/Timetable/DetailsRow'
import DetailsSymbol from '@/components/Elements/Timetable/DetailsSymbol'
import Separator from '@/components/Elements/Timetable/Separator'
import ShareCard from '@/components/Elements/Timetable/ShareCard'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { chevronIcon } from '@/components/Elements/Universal/Icon'
import ShareHeaderButton from '@/components/Elements/Universal/ShareHeaderButton'
import { RouteParamsContext } from '@/components/contexts'
import { type FormListSections, type SectionGroup } from '@/types/components'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import { Buffer } from 'buffer/'
import {
    useFocusEffect,
    useLocalSearchParams,
    useNavigation,
    useRouter,
} from 'expo-router'
import moment from 'moment'
import React, { useCallback, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Share, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ViewShot, { captureRef } from 'react-native-view-shot'

export default function TimetableDetails(): JSX.Element {
    const router = useRouter()
    const navigation = useNavigation()
    const { updateRouteParams } = useContext(RouteParamsContext)
    const { styles } = useStyles(stylesheet)
    const { lecture: lectureParam } = useLocalSearchParams()
    const { t } = useTranslation('timetable')
    const lectureString = Array.isArray(lectureParam)
        ? lectureParam[0]
        : lectureParam
    const shareRef = useRef<ViewShot>(null)
    const lecture: FriendlyTimetableEntry | null =
        lectureString === undefined
            ? null
            : JSON.parse(Buffer.from(lectureString, 'base64').toString())

    useFocusEffect(
        useCallback(() => {
            if (lecture === null) {
                return
            }
            navigation.setOptions({
                headerRight: () => <ShareHeaderButton onPress={shareEvent} />,
            })
        }, [])
    )

    if (lecture === null) {
        return <ErrorView title="Cannot display lecture" />
    }

    const startDate = new Date(lecture.startDate)
    const endDate = new Date(lecture.endDate)

    const examSplit = lecture.exam.split('-').slice(-1)[0].trim()
    const exam = `${examSplit[0].toUpperCase()}${examSplit.slice(1)}`

    async function shareEvent(): Promise<void> {
        try {
            const uri = await captureRef(shareRef, {
                format: 'png',
                quality: 1,
            })
            trackEvent('Share', {
                type: 'lecture',
            })

            await Share.share({
                url: uri,
            })
        } catch (e) {
            console.log(e)
        }
    }

    interface HtmlItem {
        title: 'overview.goal' | 'overview.content' | 'overview.literature'
        html: string | null
    }

    const createItem = (
        titleKey: HtmlItem['title'],
        html: HtmlItem['html']
    ): SectionGroup | null => {
        if (html !== null) {
            return {
                title: t(titleKey),
                icon: chevronIcon,
                onPress: () => {
                    router.push('webView')
                    router.setParams({
                        title: t(titleKey),
                        html,
                    })
                },
            }
        }
        return null
    }

    const items = [
        createItem('overview.goal', lecture.goal),
        createItem('overview.content', lecture.contents),
        createItem('overview.literature', lecture.literature),
    ].filter(Boolean) as SectionGroup[]

    const detailsList: FormListSections[] = [
        {
            header: t('overview.title'),
            items,
        },
        {
            header: t('details.title'),
            items: [
                {
                    title: t('details.exam'),
                    value: exam,
                    layout: 'column',
                },
                {
                    title: t('details.studyGroup'),
                    value: lecture.studyGroup,
                },
                {
                    title: t('details.courseOfStudies'),
                    value: lecture.course,
                },
                {
                    title: t('details.weeklySemesterHours'),
                    value: lecture.sws,
                },
            ],
        },
    ]
    return (
        <>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.page}>
                    <DetailsRow>
                        <DetailsSymbol>
                            <View style={styles.eventColorCircle} />
                        </DetailsSymbol>
                        <DetailsBody>
                            <Text style={styles.eventName}>{lecture.name}</Text>
                            {lecture.shortName.length > 0 ? (
                                <Text style={styles.eventShortName}>
                                    {lecture.shortName}
                                </Text>
                            ) : (
                                <></>
                            )}
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />

                    <DetailsRow>
                        <DetailsSymbol>
                            <PlatformIcon
                                style={styles.icon}
                                ios={{
                                    name: 'clock',
                                    size: 21,
                                }}
                                android={{
                                    name: 'calendar_month',
                                    size: 24,
                                }}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <View style={styles.dateRow}>
                                <View>
                                    <Text style={styles.text1}>
                                        {formatFriendlyDate(startDate, {
                                            weekday: 'long',
                                            relative: false,
                                        })}
                                    </Text>

                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.text2}>
                                            {formatFriendlyTime(startDate)}
                                        </Text>

                                        <PlatformIcon
                                            style={styles.icon}
                                            ios={{
                                                name: 'chevron.forward',
                                                size: 12,
                                            }}
                                            android={{
                                                name: 'chevron_right',
                                                size: 16,
                                            }}
                                        />

                                        <Text style={styles.text2}>
                                            {formatFriendlyTime(endDate)}
                                        </Text>

                                        <Text style={styles.text2Label}>
                                            {`(${moment(endDate).diff(
                                                moment(startDate),
                                                'minutes'
                                            )} ${t('time.minutes')})`}
                                        </Text>
                                    </View>
                                </View>
                                {}
                            </View>
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />
                    {lecture.rooms.length > 0 ? (
                        <>
                            <DetailsRow>
                                <DetailsSymbol>
                                    <PlatformIcon
                                        ios={{
                                            name: 'mappin.and.ellipse',
                                            size: 21,
                                        }}
                                        android={{
                                            name: 'place',
                                            size: 24,
                                        }}
                                        style={styles.icon}
                                    />
                                </DetailsSymbol>

                                <DetailsBody>
                                    <View style={styles.roomContainer}>
                                        {lecture.rooms.map((room, i) => (
                                            <React.Fragment key={i}>
                                                <Pressable
                                                    onPress={() => {
                                                        router.navigate(
                                                            '(tabs)/map'
                                                        )
                                                        updateRouteParams(room)
                                                    }}
                                                >
                                                    <Text style={styles.text1}>
                                                        {room}
                                                    </Text>
                                                </Pressable>
                                                {i <
                                                    lecture.rooms.length -
                                                        1 && (
                                                    <Text style={styles.text1}>
                                                        {', '}
                                                    </Text>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </View>
                                </DetailsBody>
                            </DetailsRow>
                        </>
                    ) : null}

                    {lecture.lecturer !== null ? (
                        <>
                            <Separator />
                            <DetailsRow>
                                <DetailsSymbol>
                                    <PlatformIcon
                                        ios={{
                                            name: 'person',
                                            size: 21,
                                        }}
                                        android={{
                                            name: 'person',
                                            size: 24,
                                        }}
                                        style={styles.icon}
                                    />
                                </DetailsSymbol>

                                <DetailsBody>
                                    <Text style={styles.text1}>
                                        {lecture.lecturer}
                                    </Text>
                                </DetailsBody>
                            </DetailsRow>
                        </>
                    ) : null}
                    <View style={styles.formListContainer}>
                        <FormList sections={detailsList} />
                    </View>

                    <ViewShot ref={shareRef} style={styles.viewShot}>
                        <ShareCard event={lecture} />
                    </ViewShot>
                </View>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    dateRow: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 12,
        width: '100%',
    },
    detailsContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
    },
    eventColorCircle: {
        aspectRatio: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: 9999,
        width: 15,
    },
    eventName: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    eventShortName: {
        color: theme.colors.labelColor,
        fontSize: 14,
    },
    formListContainer: {
        gap: 12,
        marginTop: 24,
    },
    icon: {
        color: theme.colors.labelColor,
    },
    page: {
        display: 'flex',
        padding: PAGE_PADDING,
    },
    roomContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    text1: {
        color: theme.colors.text,
        fontSize: 18,
    },
    text2: {
        color: theme.colors.text,
        fontSize: 14,
    },
    text2Label: {
        color: theme.colors.labelColor,
        fontSize: 14,
    },
    viewShot: {
        position: 'absolute',
        transform: [{ translateX: -1000 }],
        zIndex: -1,
    },
}))
