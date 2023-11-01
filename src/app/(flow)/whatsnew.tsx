import WhatsNewBox from '@/components/Elements/Flow/WhatsnewBox'
import { type Colors } from '@/stores/colors'
import changelogData from '@/stores/data/changelog.json'
import { FlowContext } from '@/stores/provider'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { type Changelog } from '@customTypes/data'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import packageInfo from '../../../package.json'

export default function OnboardingScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const flow = React.useContext(FlowContext)
    const changelog: Changelog = changelogData

    return (
        <View style={styles.page}>
            <View style={styles.titleBox}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    What&apos;s new
                </Text>
                <Text
                    style={[
                        styles.subtitle,
                        {
                            color: colors.labelColor,
                        },
                    ]}
                >
                    in version {convertToMajorMinorPatch(packageInfo.version)}
                </Text>
            </View>

            <View style={[styles.boxesContainer, styles.boxes]}>
                {Object.keys(changelog.version)
                    .filter(
                        (key) =>
                            key ===
                            convertToMajorMinorPatch(packageInfo.version)
                    )
                    .map((key) => (
                        <View key={key} style={styles.boxes}>
                            {changelog.version[key].map(
                                ({ title, description, icon }) => (
                                    <WhatsNewBox
                                        key={title.en}
                                        title={title.en}
                                        description={description.en}
                                        icon={icon}
                                    />
                                )
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
                        flow.toggleUpdated()
                        router.push('/')
                    }}
                >
                    <Text
                        style={[
                            { color: getContrastColor(colors.primary) },
                            styles.buttonText,
                        ]}
                    >
                        Continue
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
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        borderRadius: 7,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '50%',
        alignSelf: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 15,
    },
})
