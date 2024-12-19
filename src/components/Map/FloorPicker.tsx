import PlatformIcon from '@/components/Universal/Icon'
import { MapContext } from '@/contexts/map'
import { getContrastColor } from '@/utils/ui-utils'
import * as Haptics from 'expo-haptics'
import React, { useContext } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

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
}): React.JSX.Element => {
    const { styles } = useStyles(stylesheet)
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
                            <Text style={styles.buttonText(false, false)}>
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
                            ios={{
                                name: 'xmark.circle.fill',
                                size: 26,
                            }}
                            android={{
                                name: 'cancel',
                                size: 26,
                            }}
                            web={{
                                name: 'X',
                                size: 26,
                            }}
                            style={styles.xIcon}
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
                                        true,
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
                                web={{
                                    name: 'Navigation',
                                    size: 21,
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
    borderWith: (border: boolean) => ({
        borderWidth: border ? 1 : 0,
        backgroundColor: theme.colors.card,
    }),
    button: {
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        height: 38,
        justifyContent: 'center',
        width: 38,
    },
    buttonAreaSection: {
        borderColor: theme.colors.border,
        borderRadius: 7,
        borderWidth: 1,
        marginTop: 5,
        overflow: 'hidden',
    },
    buttonDynamically: (current: boolean, floor: boolean) => ({
        borderBottomColor: theme.colors.border,
        backgroundColor: current ? theme.colors.primary : theme.colors.card,
        borderBottomWidth: floor ? 0 : 1,
    }),
    buttonText: (open: boolean, current: boolean) => ({
        fontWeight: '500',
        fontSize: 15,
        color:
            open && current
                ? getContrastColor(theme.colors.text)
                : theme.colors.text,
    }),
    icon: {
        color: theme.colors.labelColor,
    },
    xIcon: {
        color:
            UnistylesRuntime.colorScheme === 'dark' ? '#b6b6b6ff' : '#4a4a4aff',
    },
}))
