/* eslint-disable react-native/no-color-literals */
import MapScreen from '@/components/Elements/Map/MapScreen'
import { MapContext } from '@/hooks/contexts/map'
import { type ClickedMapElement } from '@/types/map'
import { type AvailableRoom, type FriendlyTimetableEntry } from '@/types/utils'
import type * as Location from 'expo-location'
import Head from 'expo-router/head'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function Screen(): JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    const [localSearch, setLocalSearch] = useState<string>('')
    const [clickedElement, setClickedElement] =
        useState<ClickedMapElement | null>(null)
    const [availableRooms, setAvailableRooms] = useState<
        AvailableRoom[] | null
    >(null)
    const [currentFloor, setCurrentFloor] = useState('EG')
    const [nextLecture, setNextLecture] = useState<
        FriendlyTimetableEntry[] | null
    >(null)
    const [location, setLocation] = useState<
        Location.LocationObject | null | 'notGranted'
    >(null)
    const contextValue = {
        localSearch,
        setLocalSearch,
        clickedElement,
        setClickedElement,
        availableRooms,
        setAvailableRooms,
        currentFloor,
        setCurrentFloor,
        location,
        setLocation,
        nextLecture,
        setNextLecture,
    }

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>Map</title>
                <meta name="Campus Map" content="Interactive Campus Map" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <View
                style={{
                    ...styles.page,
                }}
            >
                {isPageOpen ? (
                    <MapContext.Provider value={contextValue}>
                        <MapScreen />
                    </MapContext.Provider>
                ) : (
                    <></>
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
})
