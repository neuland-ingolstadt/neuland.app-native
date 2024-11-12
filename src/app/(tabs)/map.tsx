/* eslint-disable react-native/no-color-literals */
import MapScreen from '@/components/Map/MapScreen'
import { MapContext } from '@/contexts/map'
import { type ClickedMapElement, type SearchResult } from '@/types/map'
import { type AvailableRoom, type FriendlyTimetableEntry } from '@/types/utils'
import { storage } from '@/utils/storage'
import Maplibre from '@maplibre/maplibre-react-native'
import Head from 'expo-router/head'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function MapRootScreen(): JSX.Element {
    const { t } = useTranslation(['navigation'])
    const { styles } = useStyles(stylesheet)
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
    const [currentFloor, setCurrentFloor] = useState({
        floor: 'EG',
        manual: false,
    })
    const [nextLecture, setNextLecture] = useState<
        FriendlyTimetableEntry[] | null
    >(null)

    const [searchHistory, setSearchHistory] = useState<SearchResult[]>([])
    const updateSearchHistory = (newHistory: SearchResult[]): void => {
        setSearchHistory(newHistory)

        const jsonValue = JSON.stringify(newHistory)
        storage.set('mapSearchHistory', jsonValue)
    }

    const loadSearchHistory = async (): Promise<void> => {
        const jsonValue = storage.getString('mapSearchHistory')
        if (jsonValue != null) {
            try {
                const parsedValue = JSON.parse(jsonValue) as SearchResult[]
                setSearchHistory(parsedValue)
            } catch (error) {
                console.info('Failed to parse search history:', error)
            }
        } else {
            setSearchHistory([])
        }
    }
    // Load search history on component mount
    useEffect(() => {
        void loadSearchHistory()
    }, [])

    const contextValue = {
        localSearch,
        setLocalSearch,
        clickedElement,
        setClickedElement,
        availableRooms,
        setAvailableRooms,
        currentFloor,
        setCurrentFloor,
        nextLecture,
        setNextLecture,
        searchHistory,
        setSearchHistory,
        updateSearchHistory,
    }

    if (Platform.OS === 'android') {
        void Maplibre.requestAndroidLocationPermissions()
    }

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>{t('navigation.map')}</title>
                <meta name="Campus Map" content="Interactive Campus Map" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <View style={styles.page}>
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

const stylesheet = createStyleSheet((theme) => ({
    page: {
        backgroundColor: theme.colors.background,
        flex: 1,
    },
}))
