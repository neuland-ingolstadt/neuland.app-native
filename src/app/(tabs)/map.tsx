import htmlScript from '@/components/Map/html_script'
import GeoJson from '@/stores/data/rooms_neuland.json'
import { type Feature } from '@customTypes/data'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import React, { useRef } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

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
                                headerBlurEffect: 'regular',
                            },
                        }),
                        headerSearchBarOptions: {
                            placeholder: 'Search for rooms, buildings, etc.',
                            hideWhenScrolling: false,
                        },
                    }}
                    component={MapScreen}
                />
            </Stack2.Navigator>
        </>
    )
}

export const MapScreen = (): JSX.Element => {
    // inject geoson overlay to map

    const features = GeoJson[0].features

    const filterEtage = (etage: string): Feature[] => {
        return features.filter((feature) => feature.properties.Etage === etage)
    }
    const _addGeoJson = (): void => {
        const filteredFeatures = filterEtage('EG')
        filteredFeatures.forEach((feature) => {
            const coordinates = feature?.geometry?.coordinates
            const name = feature?.properties?.Raum
            const functionType = feature?.properties?.Funktion

            if (coordinates == null) return

            mapRef.current?.injectJavaScript(`
                var geojsonFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": ${JSON.stringify(coordinates)}
                    },
                    

                };

                    var roomMarker = L.geoJSON(geojsonFeature).addTo(mymap);

                    



                    L.geoJSON(geojsonFeature).addTo(mymap)
                    .bindPopup("<b>${name.toString()}</b><br />${
                        functionType != null ? functionType.toString() : ''
                    }")
                    true

            `)
        })
    }

    const mapRef = useRef<WebView>(null)

    return (
        <View style={styles.container}>
            <WebView
                ref={mapRef}
                source={{ html: htmlScript }}
                style={{ marginTop: 20 }}
                // load the overlay after the map is loaded
                onLoadEnd={() => {
                    _addGeoJson()
                }}
            />
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
    ButtonArea: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    Button: {
        width: 80,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'black',
        alignItems: 'center',
    },
    ButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
})
