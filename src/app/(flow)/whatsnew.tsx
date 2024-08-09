/* eslint-disable react-hooks/rules-of-hooks */
import WhatsNewBox from '@/components/Elements/Flow/WhatsnewBox'
import { type Colors } from '@/components/colors'
import { FlowContext } from '@/components/contexts'
import changelogData from '@/data/changelog.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Changelog } from '@/types/data'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Application from 'expo-application'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

export default function WhatsNewScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const flow = React.useContext(FlowContext)
    const changelog: Changelog = changelogData
    const { t, i18n } = useTranslation('flow')
    const version = convertToMajorMinorPatch(
        Application.nativeApplicationVersion ?? '0.0.0'
    )
    const totalItems = Object.keys(changelog.version[version] ?? []).flatMap(
        (key) => changelog.version[key]
    ).length

    const opacityValues = changelog.version[version].map(() =>
        useSharedValue(0)
    )
    const rotationValues = Array.from({ length: totalItems }, () =>
        useSharedValue(0)
    )

    const handlePress = (index: number): void => {
        if (Platform.OS === 'ios') {
            void impactAsync(ImpactFeedbackStyle.Light)
        }
        const direction = Math.random() > 0.5 ? 1 : -1
        const rotation = rotationValues[index]
        rotation.value = withSequence(
            withTiming(direction * -1.5, {
                duration: 100,
                easing: Easing.linear,
            }),
            withTiming(direction * 1, {
                duration: 100,
                easing: Easing.linear,
            }),
            withTiming(direction * -0.5, {
                duration: 100,
                easing: Easing.linear,
            }),
            withTiming(0, {
                duration: 100,
                easing: Easing.linear,
            })
        )
    }

    useEffect(() => {
        const delay = 200
        setTimeout(() => {
            opacityValues.forEach((opacity, index) => {
                opacity.value = withDelay(
                    index * 400,
                    withTiming(1, {
                        duration: 800,
                        easing: Easing.linear,
                    })
                )
            })
        }, delay)
    }, [])

    return (
        <View style={{ ...styles.page, backgroundColor: colors.contrast }}>
            <View style={styles.titleBox}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {t('whatsnew.title')}
                </Text>
                <Text
                    style={[
                        styles.subtitle,
                        {
                            color: colors.labelColor,
                        },
                    ]}
                >
                    {t('whatsnew.version', {
                        version,
                    })}
                </Text>
            </View>

            <View style={[styles.boxesContainer, styles.boxes]}>
                {Object.keys(changelog.version)
                    .filter((key) => key === version)
                    .map((key, boxIndex) => (
                        <View key={key} style={styles.boxes}>
                            {changelog.version[key].map(
                                ({ title, description, icon }, index) => {
                                    const overallIndex =
                                        boxIndex *
                                            changelog.version[key].length +
                                        index

                                    const opacityStyle = useAnimatedStyle(
                                        () => {
                                            return {
                                                opacity:
                                                    opacityValues[overallIndex]
                                                        .value,
                                            }
                                        }
                                    )

                                    const rotationStyle = useAnimatedStyle(
                                        () => {
                                            return {
                                                transform: [
                                                    {
                                                        rotateZ: `${rotationValues[overallIndex].value}deg`,
                                                    },
                                                ],
                                            }
                                        }
                                    )

                                    return (
                                        <Animated.View
                                            key={
                                                title[
                                                    i18n.language as LanguageKey
                                                ]
                                            }
                                            style={[
                                                opacityStyle,
                                                rotationStyle,
                                            ]}
                                        >
                                            <Pressable
                                                onPress={() => {
                                                    handlePress(overallIndex)
                                                }}
                                            >
                                                <WhatsNewBox
                                                    title={
                                                        title[
                                                            i18n.language as LanguageKey
                                                        ]
                                                    }
                                                    description={
                                                        description[
                                                            i18n.language as LanguageKey
                                                        ]
                                                    }
                                                    icon={icon}
                                                />
                                            </Pressable>
                                        </Animated.View>
                                    )
                                }
                            )}
                        </View>
                    ))}
            </View>
            <View style={styles.buttonContainer}>
                <Pressable
                    style={[
                        {
                            backgroundColor: colors.primary,
                        },
                        styles.button,
                    ]}
                    onPress={() => {
                        flow.setUpdated(true)
                        router.navigate('(tabs)/(index)')
                    }}
                >
                    <Text
                        style={[
                            { color: getContrastColor(colors.primary) },
                            styles.buttonText,
                        ]}
                    >
                        {t('whatsnew.continue')}
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
        gap: 20,
    },
    titleBox: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    buttonContainer: {
        flex: 1,
    },
    boxesContainer: {
        flex: 4,
        justifyContent: 'center',
    },
    boxes: {
        gap: 12,
    },
    title: {
        fontSize: 32,
        paddingBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        borderRadius: 7,
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: '50%',
        alignSelf: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 15,
    },
})
