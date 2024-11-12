import { MapContext } from '@/contexts/map'
import * as Haptics from 'expo-haptics'
import React, { useContext } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

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
    const { styles } = useStyles(stylesheet)
    const isDark = UnistylesRuntime.themeName === 'dark'
    const { currentFloor, setCurrentFloor } = useContext(MapContext)

    return (
        <View style={styles.ButtonArea}>
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
                            ...styles.buttonAreaSection,
                            ...styles.borderWith(!showAllFloors),
                        }}
                    >
                        <View style={styles.button}>
                            <Text style={styles.buttonText(true)}>
                                {currentFloor?.floor === 'EG'
                                    ? '0'
                                    : currentFloor?.floor}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            )}
            {showAllFloors && (
                <Pressable
                    onPress={() => {
                        toggleShowAllFloors()
                    }}
                >
                    <View style={styles.button}>
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
            )}
            {showAllFloors && (
                <View style={styles.buttonAreaSection}>
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
                                    styles.button,
                                    styles.buttonDynamically(
                                        currentFloor?.floor === floor,
                                        index === floors.length - 1
                                    ),
                                ]}
                            >
                                <Text
                                    style={styles.buttonText(
                                        currentFloor?.floor === floor
                                    )}
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
                    accessibilityLabel="Center on current location"
                >
                    <View
                        style={{
                            ...styles.buttonAreaSection,
                            ...styles.borderWith(true),
                        }}
                    >
                        <View style={styles.button}>
                            <PlatformIcon
                                style={styles.icon}
                                ios={{
                                    name: 'location.fill',
                                    size: 18,
                                }}
                                android={{
                                    name: 'near_me',
                                    size: 21,
                                    variant: 'outlined',
                                }}
                            />
                        </View>
                    </View>
                </Pressable>
            }
        </View>
    )
}

export default FloorPicker

const stylesheet = createStyleSheet((theme) => ({
    ButtonArea: {
        marginHorizontal: 8,
        marginTop: 110,
        position: 'absolute',
        right: 0,
    },
    icon: {
        color: theme.colors.labelColor,
    },
    buttonAreaSection: {
        borderRadius: 7,
        overflow: 'hidden',
        marginTop: 5,
        borderColor: theme.colors.border,
        borderWidth: 1,
    },
    borderWidthEmpty: {
        borderWidth: 0,
    },
    borderWithNormal: {
        borderWidth: 1,
    },
    borderWith: (border: boolean) => ({
        borderWidth: border ? 1 : 0,
        backgroundColor: theme.colors.card,
    }),
    button: {
        width: 38,
        height: 38,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    buttonDynamically: (current: boolean, floor: boolean) => ({
        borderBottomColor: theme.colors.border,
        backgroundColor: current ? theme.colors.primary : theme.colors.card,
        borderBottomWidth: floor ? 0 : 1,
    }),
    buttonText: (text: boolean) => ({
        fontWeight: '500',
        fontSize: 15,
        color: text ? theme.colors.text : theme.colors.background,
    }),
}))
