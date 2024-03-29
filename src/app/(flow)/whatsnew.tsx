import WhatsNewBox from '@/components/Elements/Flow/WhatsnewBox'
import { type Colors } from '@/components/colors'
import { FlowContext } from '@/components/contexts'
import changelogData from '@/data/changelog.json'
import { type LanguageKey } from '@/localization/i18n'
import { type Changelog } from '@/types/data'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { getContrastColor, getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import packageInfo from '../../../package.json'

export default function OnboardingScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const flow = React.useContext(FlowContext)
    const changelog: Changelog = changelogData
    const { t, i18n } = useTranslation('flow')
    const { analyticsAllowed, toggleAnalytics } = React.useContext(FlowContext)
    return (
        <View style={styles.page}>
            <StatusBar style={getStatusBarStyle()} />
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
                        version: convertToMajorMinorPatch(packageInfo.version),
                    })}
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
                                        key={
                                            title[i18n.language as LanguageKey]
                                        }
                                        title={
                                            title[i18n.language as LanguageKey]
                                        }
                                        description={
                                            description[
                                                i18n.language as LanguageKey
                                            ]
                                        }
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
                        router.navigate('/')
                        // needed to trigger the analytics toggle for users of the previous version
                        // can be removed in the future
                        if (analyticsAllowed === null) {
                            toggleAnalytics()
                        }
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
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '50%',
        alignSelf: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
    },
})
