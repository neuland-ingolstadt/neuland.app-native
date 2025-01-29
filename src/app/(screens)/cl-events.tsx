import ClEventsPage from '@/components/Events/ClEventsPage'
import ClSportsPage from '@/components/Events/ClSportsPage'
import PagerView from '@/components/Layout/PagerView'
import ToggleRow from '@/components/Universal/ToggleRow'
import {
    loadCampusLifeEvents,
    loadUniversitySportsEvents,
} from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { useQueries } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, View, useWindowDimensions } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Events(): React.JSX.Element {
    const { t } = useTranslation('common')
    const { styles } = useStyles(stylesheet)
    const results = useQueries({
        queries: [
            {
                queryKey: ['campusLifeEventsV2'],
                queryFn: loadCampusLifeEvents,
                staleTime: 1000 * 60 * 60, // 60 minutes
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
            {
                queryKey: ['universitySports'],
                queryFn: loadUniversitySportsEvents,
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
    const pages = ['events', 'sports']

    return (
        <View style={styles.page}>
            <Animated.View
                style={{
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
                    trackEvent('Route', {
                        path: 'cl-events/' + pages[page],
                    })
                }}
                scrollEnabled
                overdrag
            >
                <ClEventsPage clEventsResult={results[0]} />
                <ClSportsPage sportsResult={results[1]} />
            </PagerView>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    page: {
        flex: 1,
        marginVertical: theme.margins.page,
    },
    pagerContainer: {
        flex: 1,
    },
    toggleContainer: {
        borderColor: theme.colors.border,
        paddingBottom: 12,
        paddingHorizontal: theme.margins.page,
    },
}))
