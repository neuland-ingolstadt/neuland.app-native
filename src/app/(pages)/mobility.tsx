import NeulandAPI from '@/api/neuland-api'
import MobilityRow from '@/components/Elements/Pages/MobilityRow'
import Divider from '@/components/Elements/Universal/Divider'
import Dropdown from '@/components/Elements/Universal/Dropdown'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/stores/colors'
import MobilityJSON from '@/stores/data/mobility.json'
import { MobilityContext } from '@/stores/provider'
import {
    type Bus,
    type CLEvents,
    type Charging,
    type Parking,
    type Train,
} from '@/stores/types/neuland-api'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
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
    const {
        mobilityKind,
        mobilityStation,
        toggleMobilityStation,
        toggleMobilityKind,
    } = React.useContext(MobilityContext)

    const displayTypes = ['Bus', 'Train', 'Car', 'EV']

    const busLocations = MobilityJSON.bus.stations.map(
        (station) => station.name
    )
    const trainLocations = MobilityJSON.train.stations.map(
        (station) => station.name
    )
    const defaultBusLocation = MobilityJSON.bus.defaultStation
    const defaultTrainLocation = MobilityJSON.train.defaultStation
    useEffect(() => {
        void loadEvents(mobilityKind, getID(mobilityStation, mobilityKind))
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }, [])
    function getID(name: string, kind: string): string {
        let id
        if (kind === 'Bus') {
            id = MobilityJSON.bus.stations.find((x) => x.name === name)?.id
            if (id === undefined) {
                return defaultBusLocation
            }
        } else {
            id = MobilityJSON.train.stations.find((x) => x.name === name)?.id
            if (id === undefined) {
                return defaultTrainLocation
            }
        }

        return id
    }
    function getName(id: string, kind: string = mobilityKind): string {
        let name: string | undefined
        if (kind === 'Bus') {
            name = MobilityJSON.bus.stations.find((x) => x.id === id)?.name
            if (name === undefined) {
                return getName(defaultBusLocation, 'Bus')
            }
        } else {
            name = MobilityJSON.train.stations.find((x) => x.id === id)?.name
            if (name === undefined) {
                return getName(defaultTrainLocation, 'Train')
            }
        }
        return name
    }
    async function loadEvents(kind: string, station: string): Promise<void> {
        let mobilityData: any[] = []
        console.log('Debug: ' + kind + station)
        switch (kind.toLowerCase()) {
            case 'bus':
                mobilityData = (await NeulandAPI.getBusPlan(station)) as Bus[]
                break
            case 'train':
                mobilityData = (await NeulandAPI.getTrainPlan(
                    station
                )) as Train[]
                break
            case 'car':
                mobilityData = (await NeulandAPI.getParkingData()) as Parking[]
                break
            case 'ev':
                mobilityData =
                    (await NeulandAPI.getCharingStationData()) as Charging[]
                break
            default:
                break
        }

        const newEvents = mobilityData.map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(x.begin) : null,
            end: x.end !== null ? new Date(x.end) : null,
        }))
        setEvents(newEvents)
    }
    function onRefresh(kind: string, station: string): void {
        setLoadingState(LoadingState.LOADING)
        console.log('Station: ' + station)
        void loadEvents(kind, getID(station, kind))
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
                            onRefresh(mobilityKind, mobilityStation)
                        }}
                    />
                ) : undefined
            }
        >
            <ToggleRow
                items={displayTypes}
                selectedElement={mobilityKind}
                setSelectedElement={(x) => {
                    toggleMobilityKind(x)
                    onRefresh(x, mobilityStation)
                }}
            />

            {(mobilityKind === 'Bus' || mobilityKind === 'Train') && (
                <View style={[styles.dropDownView]}>
                    <Dropdown
                        fontSize={20}
                        data={
                            mobilityKind === 'Bus'
                                ? busLocations
                                : trainLocations
                        }
                        defaultValue={getName(mobilityStation)}
                        defaultText={getName(mobilityStation)}
                        onSelect={(x) => {
                            toggleMobilityStation(x)
                            onRefresh(mobilityKind, x)
                        }}
                        selected={getName(getID(mobilityStation, mobilityKind))}
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
                                onRefresh(mobilityKind, mobilityStation)
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
    dropDownView: {
        fontSize: 14,
        height: 50,
    },
})
