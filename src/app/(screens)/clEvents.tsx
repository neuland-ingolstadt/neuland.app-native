import ClEventsPage from '@/components/Elements/Events/ClEventsPage'
import ClSportsPage from '@/components/Elements/Events/ClSportsPage'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { type UniversitySports } from '@/types/neuland-api'
import {
    loadCampusLifeEvents,
    loadUniversitySportsEvents,
} from '@/utils/events-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { pausedToast } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQueries } from '@tanstack/react-query'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native'
import PagerView from 'react-native-pager-view'

export default function Events(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const { userFaculty } = useContext(UserKindContext)
    const [selectedLocations, setSelectedLocations] = useState<string[]>(
        userFaculty === 'Nachhaltige Infrastruktur'
            ? ['Neuburg']
            : ['Ingolstadt']
    )

    const results = useQueries({
        queries: [
            {
                queryKey: ['campusLifeEvents'],
                queryFn: loadCampusLifeEvents,
                staleTime: 1000 * 60 * 60, // 60 minutes
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
            {
                queryKey: ['universitySportj'],
                queryFn: loadUniversitySportsEvents,
                select: (
                    data: Array<{ title: string; data: UniversitySports[] }>
                ) => {
                    // filter data based on selected locations
                    console.log('data', data)
                    return data
                        .map((section) => ({
                            ...section,
                            data: section.data.filter((event) =>
                                selectedLocations.includes(event.campus)
                            ),
                        }))
                        .filter((section) => section.data.length > 0)
                },
                staleTime: 1000 * 60 * 60, // 60 minutes
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
        ],
    })

    const clEventsResult = results[0]
    const sportsResult = results[1]

    const scrollY = new Animated.Value(0)

    useEffect(() => {
        if (
            (clEventsResult.isPaused && clEventsResult.data != null) ||
            (sportsResult.isPaused && sportsResult.data != null)
        ) {
            pausedToast()
        }
    }, [sportsResult.isPaused, clEventsResult.isPaused])
    const [selectedData, setSelectedData] = useState<number>(0)
    const screenHeight = useWindowDimensions().height

    const pagerViewRef = useRef<PagerView>(null)
    function setPage(page: number): void {
        pagerViewRef.current?.setPage(page)
    }
    const displayTypes = ['Events', t('pages.clEvents.sports.title')]

    return (
        <View
            style={{
                paddingVertical: PAGE_PADDING,
                ...styles.pagerContainer,
            }}
        >
            <Animated.View
                style={{
                    borderColor: colors.border,
                    borderBottomWidth: scrollY.interpolate({
                        inputRange: [0, 0, 1],
                        outputRange: [0, 0, 0.5],
                        extrapolate: 'clamp',
                    }),
                    ...styles.toggleContainer,
                }}
            >
                <ToggleRow
                    items={displayTypes}
                    selectedElement={selectedData}
                    setSelectedElement={setPage}
                />
            </Animated.View>

            <PagerView
                ref={pagerViewRef}
                style={{
                    ...styles.pagerContainer,
                    height: screenHeight,
                }}
                initialPage={0}
                onPageSelected={(e) => {
                    const page = e.nativeEvent.position
                    setSelectedData(page)
                }}
                scrollEnabled
                overdrag
            >
                <ClEventsPage clEventsResult={results[0]} />
                <ClSportsPage
                    sportsResult={results[1]}
                    selectedLocations={selectedLocations}
                    setSelectedLocations={setSelectedLocations}
                />
            </PagerView>
        </View>
    )
}

const styles = StyleSheet.create({
    pagerContainer: {
        flex: 1,
    },
    toggleContainer: {
        paddingBottom: 12,
    },
})
