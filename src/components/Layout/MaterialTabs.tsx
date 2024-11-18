import PlatformIcon from '@/components/Universal/Icon'
import Color from 'color'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Easing } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

import MaterialBottomTabs from './MaterialTabbar'

const MaterialTabs = (): JSX.Element => {
    const { styles, theme: styleTheme } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')

    return (
        <MaterialBottomTabs
            sceneAnimationEasing={Easing.ease}
            activeColor={styleTheme.colors.text}
            inactiveColor={styleTheme.colors.labelColor}
            activeIndicatorStyle={styles.indicator}
            barStyle={styles.barStyle}
            keyboardHidesNavigationBar={false}
        >
            <MaterialBottomTabs.Screen
                name="(index)"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'home',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'house',
                                size: 17,
                            }}
                            style={{
                                color: props.color,
                            }}
                        />
                    ),
                }}
            ></MaterialBottomTabs.Screen>

            <MaterialBottomTabs.Screen
                name="(timetable)"
                options={{
                    title: 'Timetable',
                    tabBarLabel: t('navigation.timetable'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'calendar_month',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'calendar',
                                size: 17,
                            }}
                            style={{
                                color: props.color,
                            }}
                        />
                    ),
                }}
            />

            <MaterialBottomTabs.Screen
                name="map"
                options={{
                    tabBarLabel: t('navigation.map'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'map',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'map',
                                size: 17,
                            }}
                            style={{
                                color: props.color,
                            }}
                        />
                    ),
                }}
            />
            <MaterialBottomTabs.Screen
                name="(food)"
                options={{
                    tabBarLabel: t('navigation.food'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'fastfood',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'fork.knife',
                                size: 17,
                            }}
                            style={{
                                color: props.color,
                            }}
                        />
                    ),
                }}
            />
        </MaterialBottomTabs>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    barStyle: {
        backgroundColor:
            UnistylesRuntime.themeName === 'dark'
                ? Color(theme.colors.card)
                      .mix(Color(theme.colors.primary), 0.04)
                      .hex()
                : Color(theme.colors.card)
                      .mix(Color(theme.colors.primary), 0.1)
                      .hex(),
    },
    indicator: {
        backgroundColor:
            UnistylesRuntime.themeName === 'dark'
                ? Color(theme.colors.card)
                      .mix(Color(theme.colors.primary), 0.06)
                      .lighten(1.4)
                      .saturate(1)
                      .hex()
                : Color(theme.colors.card)
                      .mix(Color(theme.colors.primary), 0.3)
                      .darken(0.05)
                      .saturate(0.1)
                      .hex(),
    },
}))

export default MaterialTabs
