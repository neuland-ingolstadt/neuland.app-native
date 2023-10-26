import WhatsnewBox from '@/components/Elements/Universal/WhatsnewBox'
import { type Colors } from '@/stores/colors'
import changelogData from '@/stores/data/changelog.json'
import { FlowContext } from '@/stores/provider'
import { getContrastColor } from '@/utils/ui-utils'
import { type Changelog } from '@customTypes/data'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

import packageInfo from '../../../package.json'

export default function OnboardingScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const flow = React.useContext(FlowContext)
    const changelog: Changelog = changelogData

    return (
        <View>
            <Text
                style={{
                    color: colors.text,
                    fontSize: 26,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    paddingTop: 20,
                    paddingBottom: 10,
                }}
            >
                {' '}
                What&apos;s new?{' '}
            </Text>
            <Text
                style={{
                    color: colors.labelColor,
                    fontSize: 14,
                    textAlign: 'center',
                    paddingBottom: 20,
                }}
            >
                in Version {packageInfo.version}
            </Text>

            <View style={{ height: '80%', justifyContent: 'space-around' }}>
                {Object.keys(changelog.version)
                    .filter((key) => key === packageInfo.version)
                    .map((key) => (
                        <View
                            key={key}
                            style={{
                                flexDirection: 'column',
                                paddingHorizontal: 20,
                                paddingTop: 20,
                                paddingBottom: 10,
                                gap: 10,
                                justifyContent: 'flex-start',
                            }}
                        >
                            {changelog.version[key].map(
                                ({ title, description, icon }) => (
                                    <WhatsnewBox
                                        key={title.en}
                                        title={title.en}
                                        description={description.en}
                                        icon={icon}
                                    />
                                )
                            )}
                        </View>
                    ))}

                <View style={{}}>
                    <Pressable
                        style={{
                            backgroundColor: colors.primary,
                            borderRadius: 5,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            width: '50%',
                            alignSelf: 'center',
                            marginTop: 20,
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            router.push('/')
                            flow.toggleUpdated()
                            console.log(flow.isUpdated)
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                color: getContrastColor(colors.primary),
                            }}
                        >
                            Continue
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}
