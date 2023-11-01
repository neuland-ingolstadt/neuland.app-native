import NeulandAPI from '@/api/neuland-api'
import MobilityRow from '@/components/Elements/Pages/MobilityRow'
import Divider from '@/components/Elements/Universal/Divider'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/stores/colors'
import MobilityJSON from '@/stores/data/mobility.json'
import { MobilityContext } from '@/stores/provider'
import { type CLEvents } from '@/stores/types/neuland-api'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SelectList } from 'react-native-dropdown-select-list'
import { RefreshControl } from 'react-native-gesture-handler'

export default function Mobility(): JSX.Element {
    const [events, setEvents] = useState<CLEvents[]>([])
    const colors = useTheme().colors as Colors
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
    const [error, setError] = useState<Error | null>(null)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const { mobilityKind, toggleMobilityKind } =
        React.useContext(MobilityContext)
    const { mobilityStation, toggleMobilityStation } =
        React.useContext(MobilityContext)

    const displayTypes = ['Bus', 'Train', 'Car', 'EV']
    const busLocations = [{}]
    const trainLocations = [{}]
    trainLocations.pop()
    busLocations.pop()
    MobilityJSON.bus.stations.map((station) =>
        busLocations.push({ key: station.id, value: station.name })
    )
    MobilityJSON.train.stations.map((station) =>
        trainLocations.push({ key: station.id, value: station.name })
    )
    const [selectedLocation, setSelectedLocation] =
        useState<string>(mobilityStation)
    useEffect(() => {
        if (mobilityKind === 'Hochschule') {
            toggleMobilityKind('Bus')
        }
        void loadEvents(mobilityKind)
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }, [])
    function getID(name: string, type: string): string {
        let id
        if (type === 'bus') {
            id = MobilityJSON.bus.stations.find((x) => x.name === name)?.id
        } else {
            id = MobilityJSON.train.stations.find((x) => x.name === name)?.id
        }
        if (id === undefined) {
            return ''
        }
        return id
    }
    async function loadEvents(kind: string): Promise<void> {
        let mobilityData: any[] = []
        switch (kind.toLowerCase()) {
            case 'bus':
                if (getID(selectedLocation, kind.toLowerCase()) === '') {
                    break
                }
                mobilityData = (await NeulandAPI.getBusPlan(
                    getID(selectedLocation, kind.toLowerCase())
                )) as CLEvents[]
                break
            case 'train':
                if (getID(selectedLocation, kind.toLowerCase()) === '') {
                    break
                }
                mobilityData = (await NeulandAPI.getTrainPlan(
                    getID(selectedLocation, kind.toLowerCase())
                )) as CLEvents[]
                break
            case 'car':
                mobilityData = (await NeulandAPI.getParkingData()) as CLEvents[]
                break
            case 'ev':
                mobilityData =
                    (await NeulandAPI.getCharingStationData()) as CLEvents[]
                break
        }
        const newEvents = mobilityData.map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(x.begin) : null,
            end: x.end !== null ? new Date(x.end) : null,
        }))
        setEvents(newEvents)
    }
    function onRefresh(kind: string): void {
        setLoadingState(LoadingState.LOADING)
        void loadEvents(kind)
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }
    return (
        <ScrollView
            refreshControl={
                loadingState !== LoadingState.LOADING &&
                loadingState !== LoadingState.LOADED ? (
                    <RefreshControl
                        refreshing={loadingState === LoadingState.REFRESHING}
                        onRefresh={() => {
                            onRefresh(mobilityKind)
                        }}
                    />
                ) : undefined
            }
        >
            <ToggleRow
                items={displayTypes}
                selectedElement={mobilityKind}
                setSelectedElement={(x) => {
                    if (x !== mobilityKind) {
                        onRefresh(x)
                        toggleMobilityKind(x)
                    }
                }}
            />
            {(mobilityKind === 'Bus' || mobilityKind === 'Train') && (
                <View style={{ height: 'auto' }}>
                    <SelectList
                        search={true}
                        maxHeight={50000}
                        setSelected={(val: React.SetStateAction<string>) => {
                            setSelectedLocation(val)
                            toggleMobilityStation(val)
                        }}
                        data={
                            mobilityKind === 'Bus'
                                ? busLocations
                                : trainLocations
                        }
                        save="value"
                        defaultOption={{
                            key: mobilityStation,
                            value: mobilityStation,
                        }}
                        onSelect={() => {
                            onRefresh(mobilityKind)
                        }}
                    />
                </View>
            )}
            <ScrollView
                refreshControl={
                    loadingState !== LoadingState.LOADING ? (
                        <RefreshControl
                            refreshing={
                                loadingState === LoadingState.REFRESHING
                            }
                            onRefresh={() => {
                                onRefresh(mobilityKind)
                            }}
                        />
                    ) : undefined
                }
            >
                {loadingState === LoadingState.LOADING && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
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
                            style={[styles.errorInfo, { color: colors.text }]}
                        >
                            An error occurred while loading the data.{'\n'}Pull
                            down to refresh.
                        </Text>
                    </View>
                )}
                {loadingState === LoadingState.LOADED && (
                    <>
                        <View
                            style={[
                                styles.loadedContainer,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            {events.map((event, index) => (
                                <React.Fragment key={index}>
                                    <MobilityRow
                                        item={event}
                                        colors={colors}
                                        detailed={true}
                                        kind={mobilityKind.toLowerCase()}
                                    />
                                    {index !== events.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                            width={'90%'}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    errorMessage: {
        paddingTop: 100,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadedContainer: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '95%',
        marginTop: 14,
        marginBottom: 24,
        justifyContent: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 20,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    button: {
        flex: 1,
        backgroundColor: 'yellow',
        width: '100%',
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
    },
})
