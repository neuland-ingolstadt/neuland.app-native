import { type Colors } from '@/components/colors'
import { MapContext } from '@/hooks/contexts/map'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import React, { useContext } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

interface FloorPickerProps {
    floors: string[]
    showAllFloors: boolean
    toggleShowAllFloors: () => void
    setCameraTriggerKey: React.Dispatch<React.SetStateAction<number>>
}

const FloorPicker: React.FC<FloorPickerProps> = ({
    floors,
    showAllFloors,
    toggleShowAllFloors,
    setCameraTriggerKey,
}): JSX.Element => {
    const theme = useTheme()
    const colors = theme.colors as Colors
    const isDark = theme.dark
    const { currentFloor, setCurrentFloor } = useContext(MapContext)

    return (
        <View style={styles.ButtonArea}>
            <View>
                {!showAllFloors && (
                    <Pressable
                        onPress={() => {
                            toggleShowAllFloors()
                        }}
                        onLongPress={() => {
                            if (currentFloor?.floor === 'EG') {
                                toggleShowAllFloors()
                            } else {
                                setCurrentFloor({ floor: 'EG', manual: true })
                                if (
                                    Platform.OS === 'ios' &&
                                    currentFloor?.floor !== 'EG'
                                ) {
                                    void Haptics.impactAsync(
                                        Haptics.ImpactFeedbackStyle.Soft
                                    )
                                }
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
                                    {currentFloor?.floor === 'EG'
                                        ? '0'
                                        : currentFloor?.floor}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                )}
                {showAllFloors && (
                    <View style={[]}>
                        <Pressable
                            onPress={() => {
                                toggleShowAllFloors()
                            }}
                        >
                            <View style={styles.Button}>
                                <PlatformIcon
                                    color={isDark ? '#b6b6b6ff' : '#4a4a4aff'}
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
                                    if (Platform.OS === 'ios') {
                                        void Haptics.selectionAsync()
                                    }
                                    setCurrentFloor({ floor, manual: true })
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
                                                currentFloor?.floor === floor
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
                                                    currentFloor?.floor ===
                                                    floor
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
                            setCameraTriggerKey((prev) => prev + 1)
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
        marginHorizontal: 8,
        marginTop: 110,
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
