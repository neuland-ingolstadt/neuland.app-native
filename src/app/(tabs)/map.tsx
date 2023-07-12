import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

const Stack2 = createNativeStackNavigator()

export default function Screen(): JSX.Element {
    return (
        <>
            <Head>
                <title>Map</title>
                <meta name="Campus Map" content="Interactive Campus Map" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <Stack.Screen
                options={{
                    headerShown: false,
                    headerBackButtonMenuEnabled: false,
                }}
            />
            <Stack2.Navigator>
                <Stack2.Screen
                    name="Map"
                    options={{
                        title: 'Campus Map',
                        headerShown: true,
                        headerLargeTitle: true,
                        ...Platform.select({
                            ios: {
                                headerTransparent: true,
                                headerBlurEffect: 'systemMaterial',
                            },
                        }),
                        headerSearchBarOptions: {
                            placeholder: 'Search for rooms, buildings, etc.',
                        },
                    }}
                    component={MapScreen}
                />
            </Stack2.Navigator>
        </>
    )
}

export const MapScreen = (): JSX.Element => {
    return (
        <View style={styles.container}>
            <MapView
                showsPointsOfInterest={false}
                showsBuildings={false}
                mapType={Platform.OS === 'android' ? 'none' : 'standard'}
                style={styles.map}
                initialRegion={{
                    latitude: 48.76659,
                    longitude: 11.43328,
                    latitudeDelta: 0.0022,
                    longitudeDelta: 0.00421,
                }}
                loadingEnabled={true}
                showsUserLocation={true}
                showsMyLocationButton={true}
                userLocationCalloutEnabled={true}
            >
                <Marker
                    draggable
                    coordinate={{ latitude: 48.76659, longitude: 11.43328 }}
                    title={'THI'}
                    description={'Technische Hochschule Ingolstadt'}
                />
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
})
