import { type Colors } from '@/components/colors'
import { MapContext } from '@/hooks/contexts/map'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { getCurrentPositionAsync } from 'expo-location'
import * as Location from 'expo-location'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { type WebView } from 'react-native-webview'

import PlatformIcon from '../Universal/Icon'
import { _injectCurrentLocation, _setView } from './leaflet'

interface FloorPickerProps {
    floors: string[]
    showAllFloors: boolean
    toggleShowAllFloors: () => void
    mapRef: React.RefObject<WebView>
}

const FloorPicker: React.FC<FloorPickerProps> = ({
    floors,
    showAllFloors,
    toggleShowAllFloors,
    mapRef,
}): JSX.Element => {
    const colors = useTheme().colors as Colors
    const { currentFloor, setCurrentFloor, setLocation } =
        useContext(MapContext)
    const { t } = useTranslation('common')
    const locationAlert = (): void => {
        Alert.alert(
            t('pages.map.details.location.title'),
            t('pages.map.details.location.alert'),
            [
                {
                    text: t('misc.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('pages.map.details.location.settings'),
                    onPress: () => {
                        void Linking.openSettings()
                    },
                },
            ]
        )
    }

    async function getCurrentPosition(): Promise<void> {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
            setLocation('notGranted')
            locationAlert()
        } else {
            try {
                const location = await getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                })
                setLocation(location)
                _injectCurrentLocation(
                    mapRef,
                    colors,
                    Math.min(location.coords.accuracy ?? 5, 80),
                    [location.coords.latitude, location.coords.longitude]
                )
                _setView(
                    [location.coords.latitude, location.coords.longitude],
                    mapRef
                )
            } catch (e) {
                console.error(e)
            }
        }
    }
    return (
        <View style={styles.ButtonArea}>
            <View>
                {!showAllFloors && (
                    <Pressable
                        onPress={() => {
                            toggleShowAllFloors()
                            if (Platform.OS === 'ios') {
                                void Haptics.selectionAsync()
                            }
                        }}
                        onLongPress={() => {
                            setCurrentFloor('EG')
                            if (Platform.OS === 'ios') {
                                void Haptics.selectionAsync()
                            }
                        }}
                    >
                        <View
                            style={{
                                ...styles.ButtonAreaSection,
                                ...(!showAllFloors
                                    ? styles.borderWithNormal
                                    : styles.borderWidthEmpty),
                                borderColor: colors.border,
                                backgroundColor: colors.card,
                            }}
                        >
                            <View style={styles.Button}>
                                <Text
                                    style={{
                                        ...styles.ButtonText,
                                        color: colors.text,
                                    }}
                                >
                                    {currentFloor === 'EG' ? '0' : currentFloor}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                )}
                {showAllFloors && (
                    <View style={[]}>
                        <Pressable
                            onPress={() => {
                                if (Platform.OS === 'ios') {
                                    void Haptics.selectionAsync()
                                }
                                toggleShowAllFloors()
                            }}
                        >
                            <View style={styles.Button}>
                                <PlatformIcon
                                    color={'#4a4a4aff'}
                                    ios={{
                                        name: 'xmark.circle.fill',
                                        size: 26,
                                    }}
                                    android={{
                                        name: 'cancel',
                                        size: 26,
                                    }}
                                />
                            </View>
                        </Pressable>
                    </View>
                )}
                {showAllFloors && (
                    <View
                        style={[
                            styles.ButtonAreaSection,
                            {
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {floors.map((floor, index) => (
                            <Pressable
                                onPress={() => {
                                    setCurrentFloor(floor)
                                }}
                                key={index}
                            >
                                <View
                                    style={[
                                        styles.Button,
                                        // eslint-disable-next-line react-native/no-inline-styles
                                        {
                                            borderBottomColor: colors.border,
                                            backgroundColor:
                                                currentFloor === floor
                                                    ? colors.primary
                                                    : colors.card,
                                            borderBottomWidth:
                                                index === floors.length - 1
                                                    ? 0
                                                    : 1,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.ButtonText,
                                            {
                                                color:
                                                    currentFloor === floor
                                                        ? colors.background
                                                        : colors.text,
                                            },
                                        ]}
                                    >
                                        {floor === 'EG' ? '0' : floor}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
                {
                    <Pressable
                        onPress={() => {
                            void getCurrentPosition()
                        }}
                    >
                        <View
                            style={{
                                ...styles.ButtonAreaSection,
                                ...styles.borderWithNormal,
                                borderColor: colors.border,
                                backgroundColor: colors.card,
                            }}
                        >
                            <View style={styles.Button}>
                                <PlatformIcon
                                    color={colors.labelColor}
                                    ios={{
                                        name: 'location.fill',
                                        size: 18,
                                    }}
                                    android={{
                                        name: 'near_me',
                                        size: 22,
                                    }}
                                />
                            </View>
                        </View>
                    </Pressable>
                }
            </View>
        </View>
    )
}

export default FloorPicker

const styles = StyleSheet.create({
    ButtonArea: {
        marginHorizontal: 10,
        marginTop: 100,
        position: 'absolute',
        right: 0,
    },
    ButtonAreaSection: {
        borderRadius: 7,
        overflow: 'hidden',
        marginTop: 5,
        borderWidth: 1,
    },
    borderWidthEmpty: {
        borderWidth: 0,
    },
    borderWithNormal: {
        borderWidth: 1,
    },
    Button: {
        width: 38,
        height: 38,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    ButtonText: {
        fontWeight: '500',
        fontSize: 14,
    },
})
