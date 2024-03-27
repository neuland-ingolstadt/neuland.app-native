import { type Colors } from '@/components/colors'
import { MapContext } from '@/hooks/contexts/map'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import React, { useContext } from 'react'
import {
    Animated,
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
    const { currentFloor, setCurrentFloor, location } = useContext(MapContext)
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
                    >
                        <Animated.View
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
                        </Animated.View>
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
                                        name: 'close',
                                        size: 22,
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
                            if (location === null) return
                            _injectCurrentLocation(
                                mapRef,
                                colors,
                                location.coords.accuracy ?? 5,
                                [
                                    location.coords.latitude,
                                    location.coords.longitude,
                                ]
                            )
                            _setView(
                                [
                                    location.coords.latitude,
                                    location.coords.longitude,
                                ],
                                mapRef
                            )
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
                {/* {filteredRooms.length === 1 && (
                    <View
                        style={[
                            styles.ButtonAreaSection,
                            {
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Pressable
                            onPress={() => {
                                handleShareModal()
                            }}
                        >
                            <View
                                style={[
                                    styles.Button,
                                    {
                                        backgroundColor: colors.card,
                                    },
                                ]}
                            >
                                <PlatformIcon
                                    color={colors.text}
                                    ios={{
                                        name: 'square.and.arrow.up',
                                        size: 18,
                                    }}
                                    android={{
                                        name: 'share',
                                        size: 22,
                                    }}
                                />
                            </View>
                        </Pressable>
                    </View>
                )} */}
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
        borderWidth: 1,
        marginTop: 5,
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
